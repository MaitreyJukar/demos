
(function () {
    'use strict';


    if (MathInteractives.Common.Components.Theme2.Views.Tooltip) {
        return;
    }



    /**
    * View for rendering Tooltip and its related events
    *
    * @class Tooltip
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.Tooltip = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Holds the interactivity player reference
        * @attribute player
        * @type Object
        * @default null
        * @private
        */
        player: null,

        /**
        * Holds the interactivity id prefix
        * @attribute idPrefix
        * @type String
        * @default null
        * @private
        */
        idPrefix: null,
        /**
        * Holds the interactivity manager reference
        * @attribute manager
        * @type Object
        * @default null
        * @private
        */
        manager: null,

        /*
        * Stores whether tooltip contain the tts or not
        * @attribute _isTts
        * @type Bool
        * @default null
        * @private
        */
        _isTts: null,

        /**
        * Holds the text of tooltip
        *
        * @attribute text
        * @type String
        * @default null
        * @private
        */
        text: null,

        /**
        * Specifies type of tooltip to be generated
        * @attribute _tooltipType
        * @type Object
        * @default null
        */
        _tooltipType: null,

        /**
        * Id of element on which tooltip will display
        *
        * @attribute elementEl
        * @type String
        * @default null
        */
        elementEl: null,
        /**
        * Its contain constant value for leaving some space before or after the arrow on the tooltip
        *
        * @attribute space
        * @type number
        * @default 10
        */
        space: 10,
        /**
        * Its contain padding for the text
        *
        * @attribute padding
        * @type number
        * @default 10
        */
        padding: 10,
        /**
        * Its width of the left or right border of the arrow
        *
        * @attribute baseWidthOfArrow
        * @type number
        * @default 10
        */
        baseWidthOfArrow: 10,
        /**
        * tts size of with margin
        *
        * @attribute ttsSize
        * @type number
        * @default 25
        */
        ttsSize: 25,
        /**
        * Whether close button is present or not
        *
        * @property _isCloseBtnPresent
        * @type Boolean
        * @default null
        */
        _isCloseBtnPresent: null,
        /**
        * Close button view if it is present
        *
        * @property closeButtonView
        * @type Backbone.View
        * @default null
        */
        closeButtonView: null,

        /**
       * TTS button view
       *
       * @property ttsView
       * @type Backbone.View
       * @default null
       */
        ttsView: null,

        /**
       * It stores the base class of tts button
       * 
       * @property ttsBaseClass
       * @type String
       * @default null
       */
        ttsBaseClass: null,

        /**
       * Offset to be givent to text of acc div
       * 
       * @property accDivOffset
       * @type Object
       * @default null
       */
        accDivOffset: null,

        /**
        * @namespace MathInteractives.Common.Components.Theme2.Views
        * @class Tooltip
        * @constructor
        */
        initialize: function initialize() {

            this.player = this.model.get('_player');
            this.idPrefix = this.model.get('idPrefix');
            this.elementEl = this.model.get('elementEl');
            this.manager = this.model.get('manager');
            this._isTts = this.model.get('isTts');
            this.text = this.model.get('text');
            this.baseClass = this.model.get('baseClass');
            this.arrowBaseClass = this.model.get('arrowBaseClass');
            this.tabIndex = this.model.get('tabIndex');
            this.accText = this.model.get('accText');
            this.accDivOffset = this.model.get('accDivOffset');
            this._tooltipType = this.model.get('type');
            this.ttsBaseClass = this.model.get('ttsBaseClass');
            this.closeOnDocumentClick = this.model.get('closeOnDocumentClick');
            this.eleCenter = { x: $('#' + this.elementEl).width() / 2, y: $('#' + this.elementEl).height() / 2 };
            if (this.model.get('fromElementCenter') === false) {
                this.eleCenter = { x: 0, y: 0 };
            }

            this._isCloseBtnPresent = this.model.get('showCloseBtn');

            this.render();
        },

        /**
        * Renders Tooltip
        *
        * @method render
        * @public
        **/
        render: function render() {
            var type = MathInteractives.global.Theme2.Tooltip.TYPE;
            this._generateTooltip();
            if (this._tooltipType === type.GENERAL_WHITE
                || this._tooltipType === type.GENERAL) {
                this._attachEvents();
            }
        },

        /*
        * Generating a Tooltip
        *
        * @method _generateTooltip
        * @private
        */
        _generateTooltip: function () {
            var $textContainer, $ttsContainer, $arrowDiv, $borderDiv,
                isArrow = this.model.get('isArrow'),
                elementEl = this.elementEl, $el = this.$el, namespace = MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE,
                suffixedId = elementEl + (this.model.get('isHelp') ? '-help-tooltip' : '-tooltip'),
                tabContainer = $('#' + elementEl).parents('.activity-area-container .theme2-tabs');
            if (this.baseClass) {
                $el.addClass('theme2-tooltip tooltip-' + this._tooltipType.category + '-container ' + this.baseClass)
                .attr('id', suffixedId).addClass(this.model.get('identityClass'));
            }
            else {
                $el.addClass('theme2-tooltip tooltip-' + this._tooltipType.category + '-container')
                .attr('id', suffixedId).addClass(this.model.get('identityClass'));
            }


            $textContainer = $('<div>', {
                'id': suffixedId + '-text-container',
                'class': 'text-container'
            }).html(this.text);

            $ttsContainer = $('<div>', {
                'id': suffixedId + '-tts',
                'class': 'tts-container'
            });

            $borderDiv = $('<div>', {
                'class': 'border-div'
            });

            if (this.arrowBaseClass) {
                $arrowDiv = $('<div>', {
                    'class': 'arrow-div ' + this.arrowBaseClass
                });
            }
            else {
                $arrowDiv = $('<div>', {
                    'class': 'arrow-div'
                });
            }


            $el.append($textContainer)
            .append($ttsContainer)
            .append($borderDiv)
            .append($arrowDiv);
            if (tabContainer.length > 0) {
                if (tabContainer.find('#' + $el.attr('id')).length > 0) {
                    tabContainer.find('#' + $el.attr('id')).remove();
                }
                tabContainer.append($el);
            }
            else {
                this.player.$el.append($el);
            }

            this._setCustomValues();

            if (this._isTts === false) {
                this.hideTts();
            }
            else {
                this._generateTtsForTooltip();
            }
            if (isArrow === false) {
                $borderDiv.hide();
                $arrowDiv.hide();
            }
            this.hideTooltip();
            if ((this._tooltipType === namespace.GENERAL || this._tooltipType === namespace.GENERAL_WHITE) && this.model.get('isTooltipPermanent') !== true) {
                $el.attr('data-html2canvas-ignore', 'true');
            }

            // If close button is present then create it.
            if (this._isCloseBtnPresent) {
                this._createCloseBtn();
            }

        },

        /*
        * Create the close button view
        * @method _createCloseBtn
        */
        _createCloseBtn: function () {
            this.unloadScreen('tooltip-close-btn-screen');
            this.loadScreen('tooltip-close-btn-screen');

            var $el = this.$el,
                elementEl = this.elementEl,
                suffixedId = elementEl + (this.model.get('isHelp') ? '-help-tooltip' : '-tooltip');

            var $closeBtnWrapper = $('<div>', {
                'id': suffixedId + '-close-btn-wrapper',
                'class': 'close-btn-wrapper'
            });

            var $closeBtn = $('<div>', {
                'id': suffixedId + '-close-btn-container',
                'class': 'close-btn-container'
            });
            $closeBtnWrapper.append($closeBtn);
            $el.append($closeBtnWrapper);

            var filePath = this.model.get('filePath');
            this.filePath = filePath;

            var iconProperties = {};
            iconProperties.faClass = this.getFontAwesomeClass('close');
            iconProperties.fontColor = '#ffffff';
            iconProperties.fontSize = 16;

            var buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: suffixedId + '-close-btn-container',
                    type: MathInteractives.global.Theme2.Button.TYPE.FA_ICON,
                    icon: iconProperties,
                    height: 23,
                    width: 23,
                    tooltipText: this.manager.getMessage('tooltip-close-btn-text', 0),
                    tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_LEFT
                }
            };

            this.closeButtonView = new MathInteractives.global.Theme2.Button.generateButton(buttonProperties);
        },
        /*
        * Creates hack div for passed element id
        *
        * @method _createHackDivForText
        * @private
        * @param containerId {Srting} id of container whoose hack is to be generated
        */
        _createHackDivForText: function (containerId) {
            var elementId = containerId.replace(this.idPrefix, '');
            var accObjScreen1 = {
                "elementId": elementId + '-text-container',
                "tabIndex": this.tabIndex,
                "acc": this.accText ? this.accText : this.text
            };

            if (this.accDivOffset) {
                accObjScreen1.offsetTop = this.accDivOffset.offsetTop;
                accObjScreen1.offsetLeft = this.accDivOffset.offsetLeft;
            }

            this.createAccDiv(accObjScreen1);
        },

        /*
        * It generate TTS for tooltip
        *
        * @method _generateTtsForTooltip
        * @private
        */
        _generateTtsForTooltip: function _generateTtsForTooltip() {
            var filePath = this.model.get('path'), obj,
                suffixedId = this.elementEl + (this.model.get('isHelp') ? '-help-tooltip' : '-tooltip');

            obj = {
                'idPrefix': this.idPrefix,
                'containerId': suffixedId + '-tts',
                'isEnabled': false,
                'tabIndex': 20,
                'manager': this.manager,
                'player': this.player,
                'filePath': filePath,
                messagesToPlay: [suffixedId + '-text-container']
            };

            if (this.ttsBaseClass) {
                obj.ttsBaseClass = this.ttsBaseClass;
            }

            this.ttsView = MathInteractives.global.Theme2.PlayerTTS.generateTTS(obj);
        },

        /**
        * Renders TTS Accessibility
        * params
        * @method renderTTSAccessibility
        **/
        renderTTSAccessibility: function renderTTSAccessibility() {
                this.ttsView.renderTTSAccessibility(this.tabIndex + 2);

        },
        /*
        * It is add the events to the element
        *
        * @method _attachEvents
        * @private
        */
        _attachEvents: function _attachEvents() {
            var nameSpaceForEvent = 'tooltipTouchAndHoldHandler',
                model = this.model,
                $origEle = $('#' + this.elementEl);
            //if(!this.model.get('isHelp')) {
            if (model.get('isTooltipPermanent') === true) {
                return;
            }
            //if (!$.support.touch) {
            if (model.get('isShownOnClick') === true) {
                $origEle.off('click.tooltip').on('click.tooltip', $.proxy(this.showTooltip, this));
                this.bindEventOnDocument();
            }
            else {
                if (model.get('isHelp') === false) {
                    $origEle.off('mouseenter.tooltip, mouseover.tooltip').on('mouseenter.tooltip, mouseover.tooltip', $.proxy(this._elementMouseEnter, this))
                    .off('mouseleave.tooltip').on('mouseleave.tooltip', $.proxy(this._elementMouseLeave, this));
                }
            }
            //$.fn.EnableTouch($origEle);
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($origEle);
            //}
            /*
                fix for touch and type laptops bug:- Tool tip persists on touch and hold
                right click (contextmenu event) is fired and context menu is shown
                beacuse of contextmenu touchend event is not fired and tooltip is persist
                soln:- bind contextmenu event and return false so that contextmenu is not shown and we get touchend event.
                */
            $origEle.off('contextmenu.tooltip').on('contextmenu.tooltip', function () {
                return false;
            });
        },

        /*
        * Show the tooltip on the element
        * It call when the mouse enter on the element
        *
        * @method _elementMouseEnter
        * @private
        */

        _elementMouseEnter: function _elementMouseEnter() {
            this.showTooltip();
        },

        /*
        * hide the tooltip on the element
        * It call when the mouse leave on the element
        *
        * @method _elementMouseLeave
        * @private
        */
        _elementMouseLeave: function _elementMouseLeave() {
            this.hideTooltip();
        },

        /*
        * set the custome style to the tooltip
        *
        * @method _setCustomValues
        * @private
        */
        _setCustomValues: function () {
            var containerWidth = this.model.get('containerWidth'),
                containerHeight = this.model.get('containerHeight'),
                backgroundColor = this.model.get('backgroundColor'),
                textColor = this.model.get('textColor'),
                $el = this.$el,
                padding = this.padding,
                borderColor = this.model.get('borderColor'),
                $textContainer = $el.find('.text-container');

            if (borderColor != null) {
                $el.css({
                    "border-color": borderColor
                });

                $el.find('.border-div').css({
                    "border-bottom-color": borderColor
                });
            }

            if (containerHeight != null) {
                $textContainer.css({
                    "height": containerHeight - padding + "px"
                });

            }

            if (containerWidth != null) {
                $textContainer.css({
                    "width": containerWidth - padding + "px"
                });

            }
            if (backgroundColor != null) {
                $el.css({
                    "background": backgroundColor
                });
                $el.find('.arrow-div').css({
                    "border-bottom-color": backgroundColor
                });
            }
            if (textColor != null) {
                $el.css({
                    "color": textColor
                });
            }

        },

        /**
        * It set the postion of tooltip as per the type and shows it
        *
        * @method showTooltip
        * @public
        **/
        showTooltip: function () {

            var $el = this.$el,
                playerWidth = this.model.get('playerWidth'),
                element = $('#' + this.elementEl),
                data = {
                    "elementLeft": element.offset().left,
                    "elementTop": element.offset().top,
                    "elementWidth": element.outerWidth(),
                    "elementHeight": element.outerHeight(),
                    "tooltipWidth": $el.outerWidth(),
                    "tooltipHeight": $el.outerHeight(),
                    "boarderWidth": (($el.outerWidth() - $el.width()) / 2),
                    "space": this.space,
                    "baseWidthOfArrow": this.baseWidthOfArrow,
                    "eleCenter": this.eleCenter,
                    "positionType": this.model.get('positionType'),
                    "isArrow": this.model.get('isArrow')
                },
                calcData, arrowDivTop, arrowDivLeft, deg, borderDivTop, borderDivLeft, tooltipTop, tooltipLeft, tooltipHeight,
                $arrowDiv = $el.find('.arrow-div');

            this.displayTooltip();
            this.model.trigger("show.tooltip", data);
            calcData = this.model.get('calcData');

            arrowDivTop = calcData.arrowDivTop,
                arrowDivLeft = calcData.arrowDivLeft;
            deg = calcData.deg,
                borderDivTop = calcData.borderDivTop,
                borderDivLeft = calcData.borderDivLeft,
                tooltipTop = calcData.tooltipTop,
                tooltipLeft = calcData.tooltipLeft,
                tooltipHeight = calcData.tooltipHeight;
            if (this._tooltipType === MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.FORM_VALIDATION) {
                var suffixedId = this.elementEl + (this.model.get('isHelp') ? '-help-tooltip' : '-tooltip');
                this._createHackDivForText(suffixedId);
                if (this._isTts === true) {
                    this.renderTTSAccessibility();
                }
            }

            $el.offset({
                top: tooltipTop,
                left: tooltipLeft
            });

            $el.css({
                top: Math.floor($el.position()['top']),
                left: Math.floor($el.position()['left'])
            });
            if ($el.position().left <= 10) {
                tooltipLeft = 10;
                $el.css({

                    left: tooltipLeft
                });
            }
            if ($el.position().left + $el.width() > 928) {
                tooltipLeft = (playerWidth - 10) - $el.width();
                $el.css({

                    left: tooltipLeft
                });
            }



            $el.find('.arrow-div').css({
                "top": arrowDivTop + "px",
                "left": arrowDivLeft + "px",
                "-webkit-transform": "rotate(" + deg + ")",
                "-ms-transform": "rotate(" + deg + ")",
                "-moz-transform": "rotate(" + deg + ")",
                "transform": "rotate(" + deg + ")"
            });

            //                $arrowDiv.css({
            //                 "top": arrowDivTop + "px",
            //                  "left": arrowDivLeft + "px"
            //                  });

            //            if(deg==='180deg')
            //            {
            //                $arrowDiv.css({
            //                 "border-bottom": "0",
            //                 "border-top": "10px solid #2A2A2A"
            //                  });
            //             }
            //             else if(deg==='270deg')
            //            {
            //                $arrowDiv.css({
            //                 "border-bottom": "10px solid transparent",
            //                 "border-top": "10px solid transparent",
            //                 "border-right": "10px solid #2A2A2A",
            //                 "border-left": "5px solid transparent"
            //                  });
            //             }
            //             else if(deg==='90deg')
            //            {
            //                $arrowDiv.css({
            //                 "border-bottom": "10px solid transparent",
            //                 "border-top": "10px solid transparent",
            //                 "border-left": "10px solid #2A2A2A",
            //                 "border-right": "5px solid transparent"
            //                  });
            //             }

            $el.find('.border-div').css({
                "top": borderDivTop + "px",
                "left": borderDivLeft + "px",
                "-webkit-transform": "rotate(" + deg + ")",
                "-ms-transform": "rotate(" + deg + ")",
                "-moz-transform": "rotate(" + deg + ")",
                "transform": "rotate(" + deg + ")"
            });

            if (this._isTts === true) {
                this.$el.find('.tts-container').css({
                    "margin-top": ((tooltipHeight - this.ttsSize - 2) / 2) + "px"
                }); //2 is for border
            }
            if (this.closeOnDocumentClick) {
                this.bindEventOnDocument();
            }
            if (this._isCloseBtnPresent) {
                this._setCloseBtnPosition();
                this.bindEventOnCloseBtn();
            }
        },

        _setCloseBtnPosition: function () {
            var position = this.model.get('closeBtnPosition');
            var $closeBtn = this.$('.close-btn-wrapper');

            $closeBtn.addClass(position);
        },

        /**
        * hide the tooltip
        *
        * @method hideTooltip
        * @public
        **/
        hideTooltip: function () {
            this.$el.hide();
            if (this.closeOnDocumentClick) {
                this.unbindEventOnDocument();
            }
            if (this._isCloseBtnPresent) {
                this.unbindEventOnCloseBtn();
            }
        },

        /**
        * display the tooltip
        *
        * @method  displayTooltip
        * @public
        **/
        displayTooltip: function () {
            this.$el.show();
        },
        /**
        * remove the tooltip
        *
        * @method  removeTooltip
        * @public
        **/
        removeTooltip: function () {
            this.$el.remove();
        },

        /**
        * show the tts
        *
        * @method showTts
        * @public
        **/
        showTts: function () {
            this.$el.find('.tts-container').show();
        },

        /**
        * hide the tts
        *
        * @method hideTts
        * @public
        **/
        hideTts: function () {
            this.$el.find('.tts-container').hide();
        },

        /**
        * change the text of tooltip
        *
        * @method changeText
        * @public
        * @param text {array} tooltip new text
        * @param accText {array} tooltip new acc text
        **/
        changeText: function (text, accText) {
            this.$el.find('.text-container').html(text);
            this.model.set('text', text);
            this.text = text;
            this.accText = accText;
        },

        /**
        * Change tooltip container height
        *
        * @method changeContainerHeight
        * @public
        * @param height {Number} New tooltip container height
        **/
        changeContainerHeight: function (height) {
            this.model.set('containerHeight', height);
            this.$el.find('.text-container').css('height', height + 'px');
        },
        /**
        * Change tooltip container width
        *
        * @method changeContainerWidth
        * @public
        * @param width {Number} New tooltip container width
        **/
        changeContainerWidth: function (width) {
            width = width || null;
            if (width) {
                this.model.set('containerWidth', width);
                this.$el.find('.text-container').css('width', width + 'px');
            }
            else {
                this.model.set('containerWidth', null);
            }

        },
        /**
        * Adjusts position of the tool tip depending upon the available space around tooltip
        *
        * @method adjustPosition
        * @public
        * @param positionArray {Array} array of possible positions of arrow
        **/
        adjustPosition: function (positionArray) {
            for (var i = 0; i < positionArray.length; i++) {
                this._arrowType = positionArray[i];
                this.model.set('arrowType', this._arrowType);
                if (this._checkContainment()) {
                    return i;
                }
            }
            return -1;
        },

        /**
        * Adjusts position of the tool tip wthin container
        *
        * @method _bringInContainer
        * @private
        * @return {Boolean} whether tooltip has brought in container or not
        **/
        _bringInContainer: function () {
            if (this._checkContainment()) {
                return false;
            }
            this.displayTooltip();
            var flag = false, $childDiv = this.$el,
                $el = $('#' + this.elementEl),
                $parentDiv = $childDiv.parent(),
                parentRight = $parentDiv.offset().left + $parentDiv.width(),
                parentBottom = $parentDiv.offset().top + $parentDiv.height(),
                $arrowDiv = this.$el.find('.arrow-div'),
                childLeft = parseFloat($childDiv.css('left')),
                childTop = parseFloat($childDiv.css('top')),
                childRight = childLeft + $childDiv.width(),
                childBottom = childTop + $childDiv.height(),
                leftOffset = childRight - parentRight,
                topOffset = childBottom - parentBottom + 50,
                elLeft = $el.offset().left,
                elRight = $el.width() + elLeft,
                elTop = $el.offset().top,
                elBottom = $el.height() + elTop;

            if (childRight > $parentDiv.width() - 12) {
                leftOffset += ($parentDiv.offset().left + parentRight - elRight);
                childLeft = childLeft - leftOffset;
                var arrowLeft = parseFloat($arrowDiv.css('left'));
                $arrowDiv.css({ left: $childDiv.outerWidth() - $el.width() / 2 - this.baseWidthOfArrow });
            }
            if (childBottom > $parentDiv.height() - 30) {
                topOffset -= ($parentDiv.offset().top + parentBottom - elTop + 30);
                childTop = childTop + topOffset;
                var arrowTop = parseFloat($arrowDiv.css('top'));
                $arrowDiv.css({ top: arrowTop - topOffset });
            }
            if (childLeft <= 10) {
                var arrowLeft = parseFloat($arrowDiv.css('left'));
                childLeft = elLeft - $parentDiv.offset().left;
                $arrowDiv.css({ left: ($el.width() - this.baseWidthOfArrow) / 2 });
            }
            if (childTop <= 10) {
                var arrowTop = parseFloat($arrowDiv.css('top'));
                childTop = elTop - $parentDiv.offset().top;
                $arrowDiv.css({ top: ($el.height() - this.baseWidthOfArrow) / 2 });
            }

            $childDiv.css({
                left: childLeft,
                top: childTop
            });
            return true;
        },

        /**
        * Checks whether the tool tip is inside the container
        *
        * @method _checkContainment
        * @private
        * @return {Boolean} containment whether is or not
        **/
        _checkContainment: function () {
            var flag = false, toolTip = this.$el, //$('#' + this.elementEl + '-tooltip'),
                $parent = toolTip.parent();
            this.displayTooltip();
            flag = this._isInContainer($parent, toolTip);
            this.hideTooltip();
            return flag;
        },

        /**
        * Checks whether the tool tip is inside the container
        *
        * @method _isInContainer
        * @private
        * @param $parentDiv {Object} parent div object
        * @param $childDiv {Object} child div object
        * @return {Boolean} containment whether inside or outside
        **/
        _isInContainer: function ($parentDiv, $childDiv) {
            var parentRight = $parentDiv.width(),
                parentBottom = $parentDiv.height(),
                childLeft = parseFloat($childDiv.css('left')),
                childTop = parseFloat($childDiv.css('top')),
                childRight = childLeft + $childDiv.width(),
                childBottom = childTop + $childDiv.height();
            return (childLeft > 10 && childTop > 10
                    && childRight < parentRight - 10 && childBottom < (parentBottom - 30));
        },
        /**
        * Setter function for arrow type
        *
        * @method setArrowType
        * @public
        * @param arrowType {Object} possible arrow types
        **/
        setArrowType: function (arrowType) {
            this.model.set('arrowType', arrowType);
        },

        /**
        * Getter function for arrow type
        *
        * @method getArrowType
        * @public
        * @return {Object} possible arrow types in objects
        **/
        getArrowType: function () {
            return this.model.get('arrowType');
        },
        /**
        * It checks whether space is available on specified direction or not
        *
        * @method isSpaceAvailable
        * @public
        * @param arrowType {String} direction to check for space availablility
        * @return {boolean} whether space available or not
        **/
        isSpaceAvailable: function (arrowType) {
            this.showTooltip();
            var holder = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE,
                currentOpenDirection = this.getOpenDirections();
            return currentOpenDirection[arrowType] ? true : false;
        },

        /**
        * It checks in which direction space is available
        *
        * @method getOpenDirections
        * @public
        * @return {Object} array of direction with space available
        **/
        getOpenDirections: function () {
            var $childDiv = this.$el,
                $el = $('#' + this.elementEl),
                $parentDiv = $childDiv.parent(),
                parentLeft = $parentDiv.offset().left + 20,
                parentTop = $parentDiv.offset().top + 20,
                parentRight = parentLeft + $parentDiv.width() - 30,
                parentBottom = parentTop + $parentDiv.height() - 80,
                $arrowDiv = this.$el.find('.arrow-div'),
                childLeft = parseFloat($childDiv.css('left')),
                childTop = parseFloat($childDiv.css('top')),
                childRight = childLeft + $childDiv.width(),
                childBottom = childTop + $childDiv.height(),
                elLeft = $el.offset().left,
                elRight = $el.width() + elLeft,
                elTop = $el.offset().top,
                elBottom = $el.height() + elTop,
                holder = MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE,
                openDirections = [],
                childWidth = $childDiv.outerWidth() + this.baseWidthOfArrow,
                childHeight = $childDiv.outerHeight() + this.baseWidthOfArrow;

            if ((elLeft - parentLeft) > (childWidth + this.eleCenter.x)) {
                openDirections[holder.LEFT_MIDDLE] = holder.LEFT_MIDDLE;
            }
            if ((parentRight - elRight) > (childWidth + this.eleCenter.x)) {
                openDirections[holder.RIGHT_MIDDLE] = holder.RIGHT_MIDDLE;
            }
            if ((elTop - parentTop) > (childHeight + this.eleCenter.y)) {
                openDirections[holder.TOP_MIDDLE] = holder.TOP_MIDDLE;
            }
            if ((parentBottom - elBottom) > (childHeight + this.eleCenter.y)) {
                openDirections[holder.BOTTOM_MIDDLE] = holder.BOTTOM_MIDDLE;
            }
            return openDirections;
        },
        /**
        * Binds events on the document
        * @method bindEventOnDocument
        * @public
        */
        bindEventOnDocument: function () {
            if (this.model.get('isTooltipPermanent') === true) {
                return;
            }

            var self = this;
            // hide tooltip if mousedown is fired anywhere outside it
            $(document).on('mousedown.' + self.el.id + ' touchstart.' + self.el.id, function (event) {
                if (!($(event.target).parents('#' + self.el.id).length == 1)) {
                    if (self._isTts) {
                        self.stopReading();
                    }
                    self.hideTooltip();

                    // Trigger tooltip hide on document click
                    var event = MathInteractives.Common.Components.Theme2.Views.Tooltip.EVENTS.TOOLTIP_HIDE_ON_DOCUMENT_CLICK;
                    self.trigger(event);
                }
            });
        },

        /**
        * Binds event on the close button
        * @method bindEventOnCloseBtn
        * @private
        */
        bindEventOnCloseBtn: function () {
            if (this.closeButtonView) {
                var self = this;
                // hide tooltip if mousedown is fired anywhere outside it
                this.closeButtonView.$el.on('mousedown', function (event) {
                    if (self._isTts) {
                        self.stopReading();
                    }
                    self.hideTooltip();

                    // Trigger tooltip hide on close button click
                    var event = MathInteractives.Common.Components.Theme2.Views.Tooltip.EVENTS.TOOLTIP_HIDE_ON_CLOSEBTN_CLICK;
                    self.trigger(event);
                });
            }
        },

        /**
        * Unbinds events on the document
        * @method unbindEventOnDocument
        * @public
        */
        unbindEventOnDocument: function () {
            var self = this;
            $(document).off('mousedown.' + self.el.id + ' touchstart.' + self.el.id);
        },

        /**
        * Unbinds event on the close button
        * @method unbindEventOnCloseBtn
        * @private
        */
        unbindEventOnCloseBtn: function () {
            if (this.closeButtonView) {
                this.closeButtonView.$el.off('mousedown');
            }
        }

    }, {
        /**
        * Type of Tooltip
        *
        * @property TYPE
        * @type Object
        * @static
        **/
        TYPE: {
            CUSTOM: { id: 'custom', category: 'custom' },
            GENERAL: { id: 'general', category: 'general', class: "tooltip-general-container" },
            FORM_VALIDATION: { id: 'form-validation', category: 'form-validation', class: "tooltip-form-validation-container" },
            GENERAL_WHITE: { id: 'general-white', category: 'general-white', class: "tooltip-general-white-container" }
        },

        /**
        * arrow Type for Tooltip
        *
        * @property ARROW_TYPE
        * @type Object
        * @static
        **/

        ARROW_TYPE: {
            TOP_LEFT: 'top-left',
            TOP_MIDDLE: 'top-middle',
            TOP_RIGHT: 'top-right',
            LEFT_TOP: 'left-top',
            LEFT_MIDDLE: 'left-middle',
            LEFT_BOTTOM: 'left-bottom',
            BOTTOM_LEFT: 'bottom-left',
            BOTTOM_MIDDLE: 'bottom-middle',
            BOTTOM_RIGHT: 'bottom-right',
            RIGHT_TOP: 'right-top',
            RIGHT_MIDDLE: 'right-middle',
            RIGHT_BOTTOM: 'right-bottom',
            TOP_LEFT_CENTER: 'top-left-center',
            TOP_RIGHT_CENTER: 'top-right-center',
            BOTTOM_LEFT_CENTER: 'bottom-left-center',
            BOTTOM_RIGHT_CENTER: 'bottom-right-center'
        },

        /**
        * justificaition of tooltip when arrow is hide
        *
        * @property POSITION_TYPE
        * @type Object
        * @static
        **/
        POSITION_TYPE: {
            CENTER: 'center',
            LEFT: 'left',
            RIGHT: 'right',
            TOP: 'top',
            BOTTOM: 'bottom'
        },

        /*
        * to generate Tooltip as per the given requirement
        * @method generateTooltip
        * @public
        * @param tooltipProps {object} properties to generate tooltip
        * @return {Object} generated tooltip's view
        */
        generateTooltip: function (tooltipProps) {
            var tooltipModel, tooltipView;
            if (tooltipProps) {

                tooltipModel = new MathInteractives.Common.Components.Theme2.Models.Tooltip(tooltipProps);
                tooltipView = new MathInteractives.Common.Components.Theme2.Views.Tooltip({ model: tooltipModel });

                return tooltipView;
            }
        },

        /*
        * Close button position type
        * @static
        */
        CLOSE_BTN_POSITION_TYPE: {
            TOP_RIGHT: 'top-right',
            TOP_LEFT: 'top-left',
            BOTTOM_LEFT: 'bottom-left',
            BOTTOM_RIGHT: 'bottom-right'
        },

        /*
        * Events type
        * @static
        */
        EVENTS: {
            TOOLTIP_HIDE_ON_DOCUMENT_CLICK: 'tooltip_hide_on_document_click',
            TOOLTIP_HIDE_ON_CLOSEBTN_CLICK: 'tooltip_hide_on_closebtn_click'
        }

    });

    MathInteractives.global.Theme2.Tooltip = MathInteractives.Common.Components.Theme2.Views.Tooltip;
})();
