
(function () {
    'use strict';

    $.extend($.support, {
        touch: "ontouchend" in document
    });

    // Use this function to get the text width for the container holding text
    // Works for containers holding a single line of text
    // Syntax $('#' + YourContainerID ).GetTextWidth();
    // Returns the width without the units in px.

    $.fn.getTextWidth = function (bDebug) {
        if (bDebug) {
            $('body').append($(this));
        }
        var html_org = $(this).html();
        var html_calc = '<span>' + html_org + '</span>'
        $(this).html(html_calc);
        var width = $(this).find('span:first').width();
        $(this).html(html_org);
        if (bDebug) {
            $(this).detach();
        }
        return width;
    };

    // Use this function to get the text height for the container holding text
    // Works for containers holding a single line of text
    // Syntax $('#' + YourContainerID ).GetTextHeight();
    // Returns the height without the units in px.

    $.fn.getTextHeight = function (bDebug) {
        if (bDebug) {
            $('body').append($(this));
        }
        var html_org = $(this).html();
        var html_calc = '<span>' + html_org + '</span>'
        $(this).html(html_calc);
        var height = $(this).find('span:first').height();
        $(this).html(html_org);
        if (bDebug) {
            $(this).detach();
        }
        return height;
    };

    MathUtilities.Components.Views = {};

    MathUtilities.Components.Views.Button = {};

    /**
    * View for rendering button and its related events
    *
    * @class Button
    * @constructor
    * @namespace Components.Views
    **/
    MathUtilities.Components.Views.Button = Backbone.View.extend({
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
        * @default 34
        * @type number
        * @private
        */
        _height: 34,

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
        * Holds the static model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        _touchStartTimer: null,

        /**
        * Calls render and attach events
        *
        * @method initialize
        **/
        initialize: function initialize() {
            this._isCustomButton = this.model.get('isCustomButton');
            this.filePath = '';
            var height = this.model.get('height');
            if (height !== null && height !== this._height) {
                this._height = height;
                this._heightChanged = true;
            }

            var padding = this.model.get('padding');
            if (padding !== null) {
                this._padding = padding;
            }

            this.render();
            this._attachEvents();
            this._attachTooltip();
        },

        /**
        * Renders button text
        *
        * @method render
        **/
        render: function render() {
            this.$btn = this.$el;
            var text = this.model.get('text');
            if (this.el.id.length === 0) {
                this.$btn = $('#' + this.model.get('id'));
            }
            if (this._isCustomButton) {
                this._generateButton();
            }
            else {
                if (text !== null) {
                    this.$btn.addClass('custom-button-text')
                            .html(text);
                }
            }

        },

        /*
        * Generating a 3 slice button
        * @method _generateButton
        */
        _generateButton: function () {

            var imagePath = this.model.get('imagePath'),
                width,
                midWidth,
                $firstChild,
                $midChild,
                $thirdChild,
                $textChild,
                text = this.model.get('text'),
                btnWidth,


            $firstChild = $('<div>', {
                'class': 'custom-button-first-child custom-button-child'

            }),
           $midChild = $('<div>', {
               'class': 'custom-button-mid-child custom-button-child'

           }),
            $thirdChild = $('<div>', {
                'class': 'custom-button-third-child custom-button-child'

            }),
            $textChild = $('<div>', {
                'class': 'custom-button-text'

            });




            this.$btn.html('')
                    .append($firstChild)
                    .append($midChild)
                    .append($thirdChild)
                    .addClass('custom-button');

            if (text !== null) {
                this.$btn.append($textChild);
                $textChild.html(this.model.get('text'));
            }

            //setting width of button
            //this will width of text-container and middle div
            width = this._getButtonWidth(text);
            btnWidth = width + $firstChild.width() + $thirdChild.width();

            this.$btn.css({
                width: btnWidth  //width
            });

            //midWidth = width - 2 * $firstChild.width();
            $midChild.css({
                'width': width //midWidth
            });

            $textChild.css({
                'width': width //midWidth
            });

            $textChild.css({ 'margin-top': (this._height - $textChild.clone().getTextHeight(true)) / 2 });

            this._changeImage();
            this._changeHeight();

        },

        /*
        * Calculates the button width
        * @method _getButtonWidth
        * @param text
        * @return {number} width
        * @private
        **/
        _getButtonWidth: function (text) {
            var width = this.model.get('width');
            if (width === null) {
                var $temp = $('<div>').addClass('custom-button-text');  //custom-button-text class added, to apply font-style of text container
                $temp.html(text);
                //$('body').append($temp);
                $(this.el).append($temp); //append to current btn-element instead of body, to apply css(scoping)
                width = $temp.getTextWidth() + 2; //+ 35; //2 px padding
                $temp.hide();
                $temp.remove();
            }

            return width;
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

            this.$btn.find('div').each(function (index) {
                if (index === 0 || index === 2) {
                    $(this).css({ 'background-image': 'url("' + imagePathIds[0] + '")' });
                }
                else if (index === 1) {
                    $(this).css({ 'background-image': 'url("' + imagePathIds[1] + '")' });
                }
            });

        },

        /*
        * Change button height if specified by user
        * @method _changeImage
        */
        _changeHeight: function () {

            var height = this._height;
            if (this._heightChanged === false) {
                return;
            }

            this.$btn.find('div').each(function (index) {
                if (index === 0 || index === 1 || index === 2) {
                    $(this).css({
                        'height': height
                    });
                }
            });

            this.$btn.css({ height: height });
            var $textChild = this.$('.custom-button-text');
            
            $textChild.css({ 'margin-top': (height - $textChild.clone().getTextHeight(true)) / 2 });

            this._generateBackgroundPosition();
        },


        /*
        * Generates new background position as per specified height
        * @method _generateBackgroundPosition
        * @private
        */
        _generateBackgroundPosition: function () {
            var backgroundPostion = { active: {}, hover: {}, down: {}, disabled: {} };
            var height = this._height;
            var padding = this._padding;
            var gapInBetween = height + padding;
            var initialActive = 0;
            var initialHover = 2 * gapInBetween;
            var initialDown = 4 * gapInBetween;
            var initialDisabled = 6 * gapInBetween;

            backgroundPostion.active[0] = initialActive;
            backgroundPostion.hover[0] = initialHover;
            backgroundPostion.down[0] = initialDown;
            backgroundPostion.disabled[0] = initialDisabled;

            backgroundPostion.active[1] = 0;
            backgroundPostion.hover[1] = gapInBetween;
            backgroundPostion.down[1] = 2 * gapInBetween;
            backgroundPostion.disabled[1] = 3 * gapInBetween;

            backgroundPostion.active[2] = initialActive + gapInBetween;
            backgroundPostion.hover[2] = initialHover + gapInBetween;
            backgroundPostion.down[2] = initialDown + gapInBetween;
            backgroundPostion.disabled[2] = initialDisabled + gapInBetween;

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
            var btnChildren = this.$btn.find('.custom-button-child');
            
            for (var divIndex = 0; divIndex < 3; divIndex++) {
                $(btnChildren[divIndex]).css({
                    'background-position': '0px -' + currentBackgroundPosition[divIndex] + 'px'
                });
            }
        },

        /**
        * Attaches mouse and touch events to button 
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var $btn = this.$btn;

            if (!$.support.touch) {
                $btn.on('mouseover', $.proxy(this._onMouseOver, this));
                $btn.on('mouseout', $.proxy(this._onMouseOut, this));
                //$btn.hover($.proxy(this._onMouseOver, this), $.proxy(this._onMouseOut, this));
                $btn.on('mousedown', $.proxy(this._onMouseDown, this));
                $btn.on('mouseup', $.proxy(this._removeTooltip, this));
            }
            else {
                $btn.on('touchstart', $.proxy(this._touchStartEvent, this));
                $btn.on('touchend', $.proxy(this._removeTooltip, this));
                //$btn.on('click', $.proxy(this._onMouseup, this));
            }
            $btn.on('click', $.proxy(this._onToggle, this));
        },

        /**
        * Sets the state of button as 'active', 'selected' or 'disabled'
        *
        * @method setButtonState
        * @param {String} [state] State to be set
        **/
        setButtonState: function setButtonState(state) {
            var staticDataHolder = MathUtilities.Components.Views.Button,
                baseClass = this.model.get('baseClass'),
                newClass = null,
                currentState = null,
                disabledClass = 'disabled',
                downClass = 'down',
                selectedClass = 'selected',
                hoverClass = 'hover',
                isCustomButton = this._isCustomButton;

            if (!isCustomButton) {
                disabledClass = baseClass + '-disabled';
                downClass = baseClass + '-down';
                selectedClass = baseClass + '-selected';
                hoverClass = baseClass + '-hover';

                this.$btn.removeClass(disabledClass + ' ' + downClass + ' ' + selectedClass + ' ' + hoverClass);
            } else {
                this.$btn.find('div').removeClass(disabledClass + ' ' + downClass + ' ' + selectedClass + ' ' + hoverClass);
            }


            switch (state) {
                case staticDataHolder.BUTTON_STATE_ACTIVE:
                    currentState = staticDataHolder.BUTTON_STATE_ACTIVE;

                    newClass = isCustomButton ? 'active' : baseClass;

                    break;

                case staticDataHolder.BUTTON_STATE_SELECTED:
                    currentState = staticDataHolder.BUTTON_STATE_SELECTED;
                    newClass = isCustomButton ? 'down' : baseClass + '-down';
                    break;

                case staticDataHolder.BUTTON_STATE_DISABLED:
                    currentState = staticDataHolder.BUTTON_STATE_DISABLED;
                    newClass = isCustomButton ? 'disabled' : baseClass + '-disabled';
                    break;
            }

            if (isCustomButton) {

                this.$btn.find('div').addClass(newClass);

                if (this._heightChanged) {
                    this._applyNewPosition(newClass);
                }
            }
            else {
                this.$btn.addClass(newClass);
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

            if (this.model.currentState === MathUtilities.Components.Views.Button.BUTTON_STATE_ACTIVE) {
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
                disabledState = MathUtilities.Components.Views.Button.BUTTON_STATE_DISABLED;

            if ((!isToggleType && !this._isBtnActive()) || (isToggleType && btnState === disabledState)) {
                this.$btn.css('cursor', 'default');
                return;
            }

            var baseClass = this.getBaseClass();
            if (this._isCustomButton) {

                if (!this.$btn.find('div').hasClass('down')) {
                    this.$btn.find('div').addClass('hover');

                    if (this._heightChanged) {
                        this._applyNewPosition('hover');
                    }
                }
            }
            else {
                this.$btn.addClass(baseClass + '-hover');
            }
            this.$btn.css('cursor', 'pointer');

            if (this.btnTooltipView) {
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
               disabledState = MathUtilities.Components.Views.Button.BUTTON_STATE_DISABLED;

            if ((!isToggleType && !this._isBtnActive()) || (isToggleType && btnState === disabledState)) {
                this.$btn.css('cursor', 'default');
                return;
            }

            var baseClass = this.getBaseClass();
            if (this._isCustomButton) {

                this.$btn.find('div').removeClass('hover');
                if (this._heightChanged) {
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
            $(document).on({
                'mouseup': $.proxy(this._onMouseup, this),
                'touchend': $.proxy(this._onMouseup, this)
            });


            if (!this._isBtnActive()) {
                return;
            }
            if (!$.support.touch && event.which !== 1) {
                if (this.$btn.find('div').hasClass('down') || this.$btn.hasClass(this.getBaseClass() + '-down')) {
                    $(document).on("contextmenu", this.returnFalse); // disable contextmenu
                }
                return;
            }
            this.isLeftDown = true;
            var baseClass = this.getBaseClass();
            if (this._isCustomButton) {


                this.$btn.find('div').addClass('down');

                if (this._heightChanged) {
                    this._applyNewPosition('down');
                }
            }
            else {
                this.$btn.addClass(baseClass + '-down');
            }


            if (this.$btn.find('div').hasClass('down') || this.$btn.hasClass(this.getBaseClass() + '-down')) {
                $(document).on("contextmenu", this.returnFalse); // disable contextmenu
            }


            if (this.btnTooltipView && $.support.touch) {
                this.btnTooltipView.showTooltip();
            }
        },

        /**
        * Removes selected state of button
        *
        * @method _onMouseup
        * @private
        **/
        _onMouseup: function _onMouseup(event) {
            if (this._touchStartTimer !== null) {
                window.clearTimeout(this._touchStartTimer);
            }

            $(document).off({
                'mouseup': $.proxy(this._onMouseup, this),
                'touchend': $.proxy(this._onMouseup, this)
            });
            if (!$.support.touch && event.which !== 1) {
                if (this.isLeftDown) {
                    $(document).on({
                        'mouseup': $.proxy(this._onMouseup, this),
                        'touchend': $.proxy(this._onMouseup, this)
                    });
                }
                else {
                    $(document).off("contextmenu", this.returnFalse); // enable contextmenu
                }
                return;
            }
            this.isLeftDown = false;
            $(document).off("contextmenu", this.returnFalse); // enable contextmenu
            var isToggleType = this.model.get('toggleButton'),
                isActive = this._isBtnActive();

            if (!isToggleType && !isActive) {
                return;
            }

            var baseClass = this.getBaseClass();
            if (this._isCustomButton) {
                if (this.getButtonState() !== MathUtilities.Components.Views.Button.BUTTON_STATE_SELECTED) {
                    this.$btn.find('div').removeClass('down');
                    if (this._heightChanged) {
                        this._applyNewPosition('active');
                    }
                }
            }
            else {
                this.$btn.removeClass(baseClass + '-down');
            }
        },


        _onToggle: function _onToggle(event) {
            if (!$.support.touch && event.which !== 1) {
                return;
            }
            if (!this.model.get('toggleButton')) {
                return;
            }
            if (this.getButtonState() !== MathUtilities.Components.Views.Button.BUTTON_STATE_DISABLED) {
                if (this._isBtnActive()) {
                    if (this._isCustomButton) {


                        this.$btn.find('div').addClass('down');

                        if (this._heightChanged) {
                            this._applyNewPosition('down');
                        }
                    } else {
                        this.$btn.addClass(this.getBaseClass() + '-down');
                    }
                    this.setButtonState(MathUtilities.Components.Views.Button.BUTTON_STATE_SELECTED);
                }
                else {
                    this.setButtonState(MathUtilities.Components.Views.Button.BUTTON_STATE_ACTIVE);
                }
            }
        },

        _touchStartEvent: function _touchStartEvent(event) {
            var thisRef = this;
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
            this.$btn.html(text);
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
            if (this.btnTooltipView) {
                if (this._touchStartTimer !== null) {
                    window.clearTimeout(this._touchStartTimer);
                }
                this.btnTooltipView.hideTooltip();
            }
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
                tooltip = new MathUtilities.Components.Models.Tooltip({
                    id: this.model.get('id') + 'tooltip',
                    text: tooltiptext,
                    elementOffsetPosition: $btn.offset(),
                    elementDimensions: { width: $btn.width(), height: $btn.height() },
                    tooltipPosition: this.model.get('tooltipPosition')
                });

            this.btnTooltipView = new MathUtilities.Components.Views.Tooltip({ model: tooltip });
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
        }

    }, {

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

        /*
        * to generate button as per the given requirement
        * @method generateButton
        * @param {object} buttonProps
        */
        generateButton: function (buttonProps) {
            var btnID;
            if (buttonProps) {
                btnID = '#' + buttonProps.id;
                var buttonModel = new MathUtilities.Components.Models.Button(buttonProps);
                var buttonView = new MathUtilities.Components.Views.Button({ el: btnID, model: buttonModel });

                return buttonView;
            }
        }
    });


    MathUtilities.Components.Button = MathUtilities.Components.Views.Button;
})();