(function () {
    'use strict';

    /**
    * View for new Accordion
    *
    * @class Accordion
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.Accordion = MathInteractives.Common.Player.Views.Base.extend({


        scrolled: 0,
        noOfRows: null,
        /**
        * initialises the view and properties
        * @method initialize
        * @public
        **/
        initialize: function initialize() {
            var options = this.options.options;
            this.player = options.player;
            this._initialiseProperties(options);
            this.initializeDefaultProperties();
            this._render();
        },

        /**
        * initialises properties passed to view
        * @method _initialiseParameters
        * @private
        **/
        _initialiseProperties: function _initialiseProperties(options) {
            this.options = options;
            this.icon = options.icon;

            //active header and header classes added to icon to differentiate and apply font awesome classes
            if (this.icon) {
                this.icon.header = this.icon.header + ' inactive-accordion-header';
                this.icon.activeHeader = this.icon.activeHeader + ' active-accordion-header';
            }
        },
        /**
        * Renders the Accordion View
        * @method _render
        * @private
        **/
        _render: function _render() {
            this._generateTts();
            this._createAccordion();
        },

        _generateTts: function _generateTts() {
            var $ttsContainer = $('<div></div>').attr({ 'id': this.idPrefix + 'theme2-accordion-tts-container', 'class': 'theme2-accordion-tts-container' }).appendTo(this.$el),
                ttsView, tooltipColorType = this.options.tooltipColorType;
            if (this.options.isTts) {
                var ttsObj = {
                    'containerId': this.idPrefix + 'theme2-accordion-tts-container',
                    'isEnabled': false,
                    //'tabIndex': ttsTabIndex,
                    'manager': this.manager,
                    'idPrefix': this.idPrefix,
                    'player': this.player,
                    'filePath': this.filePath,
                    messagesToPlay: [this.idPrefix + 'accordion'],
                    tooltipColorType: tooltipColorType ? tooltipColorType : MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL_WHITE
                };
                ttsView = MathInteractives.global.Theme2.PlayerTTS.generateTTS(ttsObj);
                //ttsView.renderTTSAccessibility(ttsTabIndex);
            }
        },

        _createAccordion: function _createAccordion() {
            var $accordionContainer = $('<div></div>'), $scrollContainer = $('<div></div>'),
                scrollbarWidth = 17;
            this.$el.addClass('accordion-wrapper-container');
            $accordionContainer.attr({
                'id': this.options.containerId + '-accordion',
                'class': 'accordion'
            });
            $scrollContainer.attr({
                'id': this.options.containerId + '-scrollbar',
                'class': 'scrollbar'
            });
            $accordionContainer.appendTo($scrollContainer);
            $scrollContainer.appendTo(this.$el)

            this._appendHeadersAndContents($accordionContainer);
            this._bindScrollingEvent($scrollContainer);
            $accordionContainer.css({ 'width': $scrollContainer.width() - scrollbarWidth });



        },


        _bindScrollingEvent: function _bindScrollingEvent($Container) {
            var self = this;
            $Container.scroll(function () {
                self.scrolled = this.scrollTop;
                //console.log()
            });
        },
        _convertToAccordion: function _convertToAccordion($accordionContainer) {
            var accordionSetting = this.options.accordionSetting, self = this, accordionProps = null,
                isHeaderClickDisable = this.options.isHeaderClickDisable, jqueryVersion = $.fn.jquery, version;
            accordionProps = {
                active: accordionSetting.active,
                animated: accordionSetting.animate,
                collapsible: true,
                icons: false,
                autoHeight: false,
                heightStyle: 'fill',
                header: 'h3'
            }
            if (isHeaderClickDisable) {
                accordionProps.disabled = true;
            }
            version = parseFloat(jqueryVersion.substring(0, jqueryVersion.lastIndexOf('.')));
            //if (version <= 1.8) {
                accordionProps.change = function (event, ui) {
                    self._onAccordionChange(event, ui);
                };
            //}
            //else {
                accordionProps.activate = function (event, ui) {
                    self._onAccordionChange(event, ui);
                };
            //}

                $accordionContainer.accordion(accordionProps);
                this.$('.ui-accordion-content').css({ 'height': '', 'overflow': '' });
        },

        _onAccordionChange: function _onAccordionChange(event, ui) {
            var staticData = MathInteractives.Common.Components.Theme2.Views.Accordion;
            if (this.options.isHeaderClickDisable) {
                this.disableAccordion(event, ui);
            }
            this.scrolled = this.$('.scrollbar')[0].scrollTop;
            this._scrollToElement(ui.newHeader);
            //this._scrollToMiddle(event, ui);

            if (this.icon) {
                this._changeIconOnClick(ui.newHeader.find('.accordion-header-icon'));
            }

            this.trigger(staticData.ACCORDION_CHANGE_EVENT, event, ui);
        },

        //_scrollToMiddle: function _scrollToMiddle(event, ui) {
        //    var $panelContainer = ui.newContent.find('.panel-container');
        //    var scrollAmt = ($panelContainer.prop('scrollWidth') - $panelContainer.innerWidth()) / 2;
        //    $panelContainer.scrollLeft(scrollAmt);
        //},


        _appendHeadersAndContents: function _appendHeadersAndContents($accordionContainer) {
            var data = this.options.data, counter = 0, dataLen = data.length,
                noOfRows = dataLen, rowNumber = dataLen,
                $header, $headerContent, $panel, $panelContent, $headerIcon, $toggleDivs, icon = this.icon, headerBaseClass = this.options.headerBaseClass,
                contentBaseClass = this.options.contentBaseClass,
                staticData = MathInteractives.Common.Components.Theme2.Views.Accordion, iconId;
            this.noOfRows = noOfRows;
            this.trigger(staticData.ADD_ROW, noOfRows, rowNumber);

            for (; counter < dataLen; counter++) {
                $header = $('<h3></h3>').attr({ 'class': headerBaseClass + ' headers' }).appendTo($accordionContainer);
                $headerContent = $('<div></div>').attr({ 'class': 'accordion-header-content', 'id': this.idPrefix + 'header-content-' + counter }).html(data[counter].header).appendTo($header);
                if (icon) {
                    iconId = this.idPrefix + 'accordion-header-icon-containr-' + counter;
                    $headerIcon = $('<div></div>').attr({ 'class': 'accordion-header-icon-container', 'id': iconId }).appendTo($headerContent);
                    $icon = $('<div></div>').attr({ 'class': 'accordion-header-icon', 'id': this.idPrefix + 'accordion-header-icon-' + counter }).appendTo($headerIcon);
                }
                $panel = $('<div></div>').attr({ 'class': contentBaseClass + ' contents' }).appendTo($accordionContainer);
                $panelContent = $('<div></div>').attr({ 'class': 'accordion-panel-content', 'id': this.idPrefix + 'panel-content-' + counter }).html(data[counter].content).appendTo($panel);
                if (icon) {
                    this._bindEventOnIcon(data[counter].content, iconId, counter);
                }
            }
            this._convertToAccordion($accordionContainer);

            this._autoScrollToLastRow();
        },

        _bindEventOnIcon: function _bindEventOnIcon(content, id, headerNo) {
            var self = this, isEmpty, icon = this.icon, $icon = this.$('#' + id);
            if (!content) {
                isEmpty = true;
                $icon.addClass('disabled');
            }
            else {
                isEmpty = false;
                $icon.removeClass('disabled');
            }
            $icon.off('click').on('click', null, { isEmpty: isEmpty, headerNo: headerNo }, function (event) {
                self._onClickIcon(event);
            });
            this._attachHoverEvents($icon, isEmpty);
            this.$('.accordion-header-icon').addClass(icon.header);
        },

        _onClickIcon: function _onClickIcon(event) {
            var isContentEmpty = event.data.isEmpty,
                staticData = MathInteractives.Common.Components.Theme2.Views.Accordion;
            if (isContentEmpty === false) {
                this.enableAccordion();
                //this.trigger(staticData.ACCORDION_HEADER_ICON_CLICK);
            }
        },

        _attachHoverEvents: function _attachHoverEvents($requiredElement, isEmpty) {
            var self = this,
                enter, leave, isEmptyContent;
            //if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                enter = 'mouseenter';
                leave = 'mouseleave';
           // }
            //else {
                //enter = 'touchstart';
                //leave = 'touchend';
            //}

            $requiredElement.off(enter).on(enter, null, {isEmpty: isEmpty}, function (event) {
                isEmptyContent = event.data.isEmpty;
                if (!isEmptyContent) {
                    $(this).addClass('hover');
                }
            });

            $requiredElement.off(leave).on(leave, function (event) {
                $(this).removeClass('hover');
            });

            MathInteractives.Common.Utilities.Models.Utils.EnableTouch($requiredElement);
        },


        _changeIconOnClick: function _changeIconOnClick($element) {
            var icon = this.icon;
            if ($element.hasClass('inactive-accordion-header')) {
                this.$('.active-accordion-header').removeClass(icon.activeHeader).addClass(icon.header);
                $element.removeClass(icon.header).addClass(icon.activeHeader);
            }
            else {
                this.$('.active-accordion-header').removeClass(icon.activeHeader).addClass(icon.header);
            }
        },

        _autoScrollToLastRow: function _autoScrollToLastRow() {
            var element = this.$(".scrollbar")[0];
            element.scrollTop = element.scrollHeight;
        },

        _scrollToElement: function _scrollToElement($contentDiv) {
            if ($contentDiv.length) {
                var contentDivRect = new MathInteractives.Common.Utilities.Models.Rect($contentDiv[0].getBoundingClientRect()),

                    $accordionDiv = this.$('.accordion'),
                    $scrollContainer = this.$('.scrollbar'),
                    accordionDivRect = new MathInteractives.Common.Utilities.Models.Rect($accordionDiv[0].getBoundingClientRect()),
                    scrollDivRect = new MathInteractives.Common.Utilities.Models.Rect($scrollContainer[0].getBoundingClientRect()),
                    scrollableAmt = contentDivRect.getTop() - scrollDivRect.getTop(), self = this;

                $scrollContainer.animate({
                    scrollTop: scrollableAmt + self.scrolled
                }, "slow");
            }
        },

        disableAccordion: function disableAccordion(event, ui) {
            this.$('.accordion').accordion("disable");
        },

        enableAccordion: function enableAccordion(event, ui) {
            this.$('.accordion').accordion("enable");
        },


        /**
        * Refreshes an accordion based on add or delete item
        * @method refreshAccordion
        * @public
        **/
        refreshAccordion: function refreshAccordion() {
            //this.$('.accordion').accordion("refresh");
            this.$(".accordion").accordion('destroy');
            this._convertToAccordion(this.$('.accordion'));

            this.$(".accordion").find('h3').removeAttr('role');
        },

        /**
        * Destroys an accordion to its pre init state
        * @method destroyAccordion
        * @public
        **/
        destroyAccordion: function destroyAccordion() {
            this.$(".accordion").accordion("destroy");
        },

        addAccordion: function addAccordion(data, index) {
            var noOfElementsInAccordion = this.$('.accordion h3').length,
                icon = this.icon,
                headerBaseClass = this.options.headerBaseClass,
                contentBaseClass = this.options.contentBaseClass,
                $accordionContainer = this.$('.accordion'),
                $header, $headerContent, $panel, $panelContent, $headerIcon, $icon,
                staticData = MathInteractives.Common.Components.Theme2.Views.Accordion, iconId;

            this.noOfRows += 1;

            this.trigger(staticData.ADD_ROW, 1, this.noOfRows);

            $header = $('<h3></h3>').attr({ 'class': headerBaseClass + ' headers' });
            $headerContent = $('<div></div>').attr({ 'class': 'accordion-header-content', 'id': this.idPrefix + 'header-content-' + noOfElementsInAccordion }).html(data.header).appendTo($header);
            if (icon) {
                iconId = this.idPrefix + 'accordion-header-icon-container' + noOfElementsInAccordion;
                $headerIcon = $('<div></div>').attr({ 'class': 'accordion-header-icon-container', 'id': iconId }).appendTo($headerContent);
                $icon = $('<div></div>').attr({ 'class': 'accordion-header-icon', 'id': this.idPrefix + 'accordion-header-icon' + noOfElementsInAccordion }).appendTo($headerIcon);
            }
            $panel = $('<div></div>').attr({ 'class': contentBaseClass + ' contents' });
            $panelContent = $('<div></div>').attr({ 'class': 'accordion-panel-content', 'id': this.idPrefix + 'panel-content-' + noOfElementsInAccordion }).html(data.content).appendTo($panel);

            this._insertAtIndex($header, $panel, index);
            this.refreshAccordion();
            if (icon) {
                this._bindEventOnIcon(data.content, iconId, noOfElementsInAccordion);
            }
            this._autoScrollToLastRow();
        },

        _insertAtIndex: function _insertAtIndex($header, $panel, index) {
            if (index === undefined || index >= this.$('.accordion h3').length) {
                this.$('.accordion').append($header).append($panel);
            }
            else {
                if (index === 0) {
                    this.$('.accordion').prepend($panel).prepend($header);
                    return;
                }
                this.$(".accordion > div:nth-child(" + (2 * index) + ")").after($panel).after($header);
            }
        },


        removeAccordion: function removeAccordion(index) {
            var $accordionContainer = this.$('.accordion'),
                noOfElements = $accordionContainer.length;
            //if index is not given remove last element
            if (index === undefined) {
                this.$(".accordion > h3:nth-child(" + (2 * noOfElements + 1) + ")").remove();
                this.$(".accordion > div:nth-child(" + (2 * noOfElements + 1) + ")").remove();
                return;
            }
            else if (index === 0) {
                this.$(".accordion > h3:nth-child(" + 1 + ")").remove();
                this.$(".accordion > div:nth-child(" + 1 + ")").remove();
                return;
            }
            this.$(".accordion > h3:nth-child(" + (2 * index + 1) + ")").remove();
            this.$(".accordion > div:nth-child(" + (2 * index + 1) + ")").remove();

            this._autoScrollToLastRow();
        },

        activeAccordion: function activeAccordion(index) {
            var $icon;
            if (this.options.isHeaderClickDisable) {
                $icon = this.$('.accordion .accordion-header-icon')[index];
                $($icon).click();
            }
            else {
                this.$('.accordion').accordion({ 'active': index });
            }
        },

        collapseAccordion: function collapseAccordion() {
            if (this.options.isHeaderClickDisable) {
                this.$('.active-accordion-header').click();
            }
            else {
                $(".accordion").accordion({ active: false }).click();
            }
        }

    }, {

        ACCORDION_CHANGE_EVENT: 'accordion-change-event',
        ADD_ROW: 'add-row',
        ACCORDION_HEADER_ICON_CLICK: 'accordion-header-icon-click',

        /**
        * Initializes the accordion view
        * and returns the view
        * @method createAccordion
        * @param accordionProps {Object} accordion properties
        * @return Newly created accordion view if the properties are passed or null otherwise
        * @static
        **/
        createAccordion: function createAccordion(accordionProps) {
            var accordionView = null;
            if (accordionProps) {
                accordionView = new MathInteractives.Common.Components.Theme2.Views.Accordion({ el: '#' + accordionProps.containerId, options: accordionProps });
            }
            return accordionView;
        }
    });
    MathInteractives.global.Theme2.Accordion = MathInteractives.Common.Components.Theme2.Views.Accordion;
})(window.MathInteractives);
