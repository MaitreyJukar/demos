(function () {
    'use strict';
    var viewNameSpace = MathInteractives.Common.Interactivities.ExponentAccordion.Views;

    /**
    * View for new Accordion
    *
    * @class Accordion
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    viewNameSpace.DerivedAccordion = MathInteractives.Common.Components.Theme2.Views.Accordion.extend({

        initialize: function initialize() {
            this.accObjectsOnAddAccordion = [];
            viewNameSpace.DerivedAccordion.__super__.initialize.apply(this, arguments);
        },

        _appendHeadersAndContents: function _appendHeadersAndContents($accordionContainer) {
            var data = this.options.data, counter = 0, dataLen = data.length, iconId,
                $header, $headerContent, $panel, $panelContent, $headerIcon, $panelContainer, icon = this.icon, headerBaseClass = this.options.headerBaseClass,
                contentBaseClass = this.options.contentBaseClass, $headerCounter, $headerData, $rowContainer, $bluePatch, panelRows, panelRowsLen, index, $rowData, $icon,
                startTabIndex = 550, tabIndex = 10,
                textToBeAppended = '';

            this.accObjects = [];
            this.disableTabElements = [];

            for (; counter < dataLen; counter++) {
                panelRows = data[counter].steps;
                panelRowsLen = panelRows.length;
                textToBeAppended = '';

                if (panelRows.length > 0) {
                    textToBeAppended = this.getAccMessage('base-exp-pair', 24);
                }


                $header = $('<h3></h3>').attr({ 'class': headerBaseClass + ' headers' }).appendTo($accordionContainer);
                $headerContent = $('<div></div>').attr({ 'class': 'accordion-header-content', 'id': this.idPrefix + 'header-content-' + counter }).appendTo($header);
                this._createAccForHeadersAndContents('header-content-' + counter, startTabIndex + (tabIndex + 1), data[counter].headerAccString  + textToBeAppended, false, false);
                $headerCounter = $('<div></div>').attr({ 'class': 'accordion-header-counter', 'id': this.idPrefix + 'header-content-counter-' + counter }).html(counter + 1).appendTo($headerContent);
                $headerData = $(data[counter].header);
                $($headerData).appendTo($headerContent);
                if (icon) {
                    iconId = this.idPrefix + 'accordion-header-icon-container-' + counter;
                    $headerIcon = $('<div></div>').attr({ 'class': 'accordion-header-icon-container', 'id': iconId }).appendTo($headerContent);
                    //this._createAccForHeadersAndContents('accordion-header-icon-container-' + counter, startTabIndex + (tabIndex + 2), data[counter].header, false, false);
                    $icon = $('<div></div>').attr({ 'class': 'accordion-header-icon', 'id': this.idPrefix + 'accordion-header-icon-' + counter }).appendTo($headerIcon);
                }
                this._numeratorDenominatorCases($headerData, $headerContent);


                $panel = $('<div></div>').attr({ 'class': 'contents' }).appendTo($accordionContainer);
                $panelContainer = $('<div></div>').attr({ 'id': this.idPrefix + 'panel-container' + counter, 'class': contentBaseClass + ' panel-container' }).appendTo($panel);
                for (index = 0; index < panelRowsLen; index++) {
                    $rowContainer = $('<div></div>').attr({ 'id': this.idPrefix + 'panel-row-container' + counter + '' + index, 'class': 'panel-row-container' }).appendTo($panelContainer);

                    $bluePatch = $('<div></div>').attr({ 'class': 'panel-row-blue-patch' }).appendTo($rowContainer);
                    $rowData = $(panelRows[index].htmlString);
                    //checks if row data has fraction tile item Or
                    // denominator does not hav any content
                    $panelContent = $('<div></div>').attr({ 'class': 'accordion-panel-content', 'id': this.idPrefix + 'panel-content-' + counter + '-' + index }).html($rowData).appendTo($rowContainer);
                    this._createAccForHeadersAndContents('panel-content-' + counter + '-' + index, (tabIndex + 2) + (index + 1), panelRows[index].accString, true, false);
                    this._numeratorDenominatorCases($rowData, $rowContainer);
                }
                this._autoScrollToLastRow();
                if (icon) {
                    this._bindEventOnIcon(panelRowsLen, iconId, counter);
                }
                tabIndex = (tabIndex + 2) + panelRowsLen;
            }
            this._convertToAccordion($accordionContainer);

            this._applyFontAwesomeForOperator();
            this._applyParenthesis();
            this._createAccDivs();
            //this._addWhiteBorderToLastContent();
        },

        events: {
            'keydown .accordion-header-content': '_headerContentKeydown'
        },

        _headerContentKeydown: function _headerContentKeydown(event) {
            var uniCode = event.keyCode ? event.keyCode : event.charCode,
                checkBrowser = MathInteractives.Common.Utilities.Models.BrowserCheck;
            if(this.options.$animationDiv.css('display') === 'block') {
                event.preventDefault();
            }
            if (uniCode === 32) {
                event.preventDefault();
                var $eventTarget = $(event.currentTarget),
                    accordionButtonDiv = $eventTarget.find('.accordion-header-icon-container'),
                    accordionArrowBtn = accordionButtonDiv.find('.accordion-header-icon'),
                    id = $eventTarget.attr('id'),
                    currentHeaderNumber = id.substring(id.lastIndexOf('-') + 1, id.length),
                    prevActiveHeader, prevHeaderId, prevHeaderNumber;
                if(!accordionButtonDiv.hasClass('disabled')) {
                    //this.$('.active-accordion-header')
                    prevActiveHeader = this.$('.active-accordion-header').closest('.accordion-header-content');
                    if(prevActiveHeader.length > 0) {
                        prevHeaderId = prevActiveHeader.attr('id');
                        prevHeaderNumber = prevHeaderId.substring(prevHeaderId.lastIndexOf('-') + 1, prevHeaderId.length);
                        this.setAccMessage('header-content-'+prevHeaderNumber, this.options.data[+prevHeaderNumber].headerAccString + this.getAccMessage('base-exp-pair', 24));
                    }
                    if(accordionArrowBtn.hasClass('inactive-accordion-header')) {
                        this.setAccMessage('header-content-'+currentHeaderNumber, this.options.data[+currentHeaderNumber].headerAccString + this.getAccMessage('base-exp-pair', 27));
                        accordionButtonDiv.trigger('mousedown').trigger('mouseup').trigger('click');
                        this.setFocus('panel-content-'+currentHeaderNumber+'-0', 450);
                    }
                    else {
                        this.setAccMessage('header-content-'+currentHeaderNumber, this.options.data[+currentHeaderNumber].headerAccString + this.getAccMessage('base-exp-pair', 24));
                        accordionButtonDiv.trigger('mousedown').trigger('mouseup').trigger('click');
                        this.setFocus('header-content-'+currentHeaderNumber, 450);
                    }
                }
            }
        },


        _bindEventOnIcon: function _bindEventOnIcon(content, id, headerNo) {
            viewNameSpace.DerivedAccordion.__super__._bindEventOnIcon.apply(this, arguments);
            if (!content) {
                //empty
                this.disableTabElements.push(id.replace(this.idPrefix, ''));
                //this.enableTab(id.replace(this.idPrefix, ''), false);
            }
        },

        _createAccForHeadersAndContents: function _createAccForHeadersAndContents(id, tabIndex, acc, isContentRow, isAddAccordion) {
            var accObj = {
                "elementId": id,
                "elemId": id,
                "tabIndex": tabIndex,
                "loc": "",
                "acc": acc,
                "offsetLeft": -3,
                "offsetTop": -3
            };
            if (isContentRow) {
                accObj.offsetLeft = -6;
                accObj.offsetTop = 0;
            }
            if (isAddAccordion) {
                this.accObjectsOnAddAccordion.push(accObj);
            }
            this.accObjects.push(accObj);
        },

        _createAccDivs: function _createAccDivs(isAddAccordion) {
            var accObjects = this.accObjects, i = 0,
                accObjectsOnAddAccordion = this.accObjectsOnAddAccordion;
            //Only create acc divs of added header and content rows
            if (isAddAccordion) {
                for (; i < accObjectsOnAddAccordion.length; i++) {
                    this.createAccDiv(accObjectsOnAddAccordion[i]);
                }
            }
            else {
                for (; i < accObjects.length; i++) {
                    this.createAccDiv(accObjects[i]);

                }

            }
            this._disableTabElements();
        },

        _disableTabElements: function () {
            var elementsToDisable = this.disableTabElements, i=0;
            for (; i < elementsToDisable.length; i++) {
                this.enableTab(elementsToDisable[i], false);
            }
            this.disableTabElements = [];
        },


        getAccObjects: function getAccObjects() {
            return this.accObjects;
        },

        setAccObjects: function setAccObjects() {
            this.accObjects = [];
        },

        //_addWhiteBorderToLastContent: function _addWhiteBorderToLastContent() {
        //    //this.$('.last-content').removeClass('last-content');
        //    //this.$('.accordion-data-header-class:last').addClass('last-content');
        //},
        _applyFontAwesomeForOperator: function _applyFontAwesomeForOperator() {
            var path = this.filePath,
                operatorClass = path.getFontAwesomeClass('dot');
            this.$('.accordion-header-content .operator-data-tab div, .accordion-panel-content .operator-data-tab div').addClass(operatorClass);
        },

        _applyParenthesis: function _applyParenthesis() {
            //this.$('.open-parenthesis-data-tab, .close-parenthesis-data-tab').css({ 'background-image': 'url"(' + this.getImagePath('bracket-data-tab') + ')"' });
            this.$('.open-parenthesis-data-tab, .close-parenthesis-data-tab').addClass('bracket-data-tab');
        },

        addAccordion: function addAccordion(data) {
            //override base method
            var $header, $headerContent, $panel, $panelContent, $headerIcon, $panelContainer, icon = this.icon, headerBaseClass = this.options.headerBaseClass,
                contentBaseClass = this.options.contentBaseClass, $headerCounter, $headerData, $rowContainer, $bluePatch, panelRows, panelRowsLen, index, $rowData, $icon,
                $accordionContainer = this.$('.accordion'),
                noOfElementsInAccordion = this.$('.accordion h3').length,
                icon = this.icon, iconId, startTabIndex = 550, tabIndex = 0,
                textToBeAppended = '';
            this.accObjectsOnAddAccordion = [];
            this.disableTabElements = [];
            panelRows = data.steps;
            panelRowsLen = panelRows.length;
            if (this.accObjects[this.accObjects.length - 1]) {
                tabIndex = this.accObjects[this.accObjects.length - 1].tabIndex;
            }
            else {
                tabIndex = (tabIndex + 2) + panelRowsLen + startTabIndex;
            }
            $header = $('<h3></h3>').attr({ 'class': headerBaseClass + ' headers' }).appendTo($accordionContainer);
            $headerContent = $('<div></div>').attr({ 'class': 'accordion-header-content', 'id': this.idPrefix + 'header-content-' + noOfElementsInAccordion }).appendTo($header);

            if (this.options.data[noOfElementsInAccordion].steps.length > 0) {
                textToBeAppended = this.getAccMessage('base-exp-pair', 24);
            }

            this._createAccForHeadersAndContents('header-content-' + noOfElementsInAccordion, (tabIndex + 2), data.headerAccString + textToBeAppended, false, true);
            $headerCounter = $('<div></div>').attr({ 'class': 'accordion-header-counter', 'id': this.idPrefix + 'header-content-counter' + noOfElementsInAccordion }).html(noOfElementsInAccordion + 1).appendTo($headerContent);
            $headerData = $(data.header);
            $($headerData).appendTo($headerContent);
            if (icon) {
                iconId = this.idPrefix + 'accordion-header-icon-container-' + noOfElementsInAccordion ;
                $headerIcon = $('<div></div>').attr({ 'class': 'accordion-header-icon-container', 'id': iconId }).appendTo($headerContent);
                //this._createAccForHeadersAndContents('accordion-header-icon-container-' + noOfElementsInAccordion, startTabIndex + (tabIndex + 2), data.header, false, true);
                $icon = $('<div></div>').attr({ 'class': 'accordion-header-icon', 'id': this.idPrefix + 'accordion-header-icon-' + noOfElementsInAccordion }).appendTo($headerIcon);
            }
            this._numeratorDenominatorCases($headerData, $headerContent);


            $panel = $('<div></div>').attr({ 'class': 'contents' }).appendTo($accordionContainer);
            $panelContainer = $('<div></div>').attr({ 'id': this.idPrefix + 'panel-container' + noOfElementsInAccordion, 'class': contentBaseClass + ' panel-container' }).appendTo($panel);
            for (index = 0; index < panelRowsLen; index++) {
                $rowContainer = $('<div></div>').attr({ 'id': this.idPrefix + 'panel-row-container' + noOfElementsInAccordion + '' + index, 'class': 'panel-row-container' }).appendTo($panelContainer);

                $bluePatch = $('<div></div>').attr({ 'class': 'panel-row-blue-patch' }).appendTo($rowContainer);
                $rowData = $(panelRows[index].htmlString);
                //checks if row data has fraction tile item Or
                // denominator does not hav any content
                $panelContent = $('<div></div>').attr({ 'class': 'accordion-panel-content', 'id': this.idPrefix + 'panel-content-' + noOfElementsInAccordion + '-' + index }).html($rowData).appendTo($rowContainer);
                this._createAccForHeadersAndContents('panel-content-' + noOfElementsInAccordion + '-' + index, (tabIndex + 2) + (index + 1), panelRows[index].accString, true, true);
                this._numeratorDenominatorCases($rowData, $rowContainer);
            }
            this.refreshAccordion();

            if (icon) {
                this._bindEventOnIcon(panelRowsLen, iconId, noOfElementsInAccordion);
            }
            this._applyFontAwesomeForOperator();
            this._applyParenthesis();
            this._autoScrollToLastRow();
            this._createAccDivs(true);
            //this._addWhiteBorderToLastContent();
        },

        removeAccordion: function (index) {
            viewNameSpace.DerivedAccordion.__super__.removeAccordion.apply(this, arguments);
            //var data = this.options.data[index || 0],
            //    stepsLen = data.steps.length, i = 0;

            //for (; i < stepsLen + 1; i++) {
            //}
                var i = this.accObjects.length - 1;
                while (i !== 0) {
                    if (this.accObjects[i].elemId === 'header-content-' + index || this.accObjects[i].elemId.indexOf('panel-content-' + index + '-') === 0) {
                        this.accObjects.pop();
                        i--;
                    }
                    else {
                        break;
                    }
                }

        },

        _onClickIcon: function _onClickIcon(event) {
            var $animationDiv = this.options.$animationDiv, isContentEmpty = event.data.isEmpty;
            viewNameSpace.DerivedAccordion.__super__._onClickIcon.apply(this, arguments);
            if (isContentEmpty === false) {
                $animationDiv.show();
                this.trigger(viewNameSpace.DerivedAccordion.ACCORDION_HEADER_ICON_CLICK, event);
            }
        },

        _onAccordionChange: function _onAccordionChange(event, ui) {
            viewNameSpace.DerivedAccordion.__super__._onAccordionChange.apply(this, arguments);
            this.options.$animationDiv.hide();
        },

        _createAccordion: function _createAccordion() {
            viewNameSpace.DerivedAccordion.__super__._createAccordion.apply(this, arguments);
            //$accordionContainer.css({ 'width': $scrollContainer.width() - scrollbarWidth });
            this.$('.accordion').css({'width': /*this.$('.scrollbar').width()*/ 908 - 17 });
        },

        _numeratorDenominatorCases: function ($rowData, $rowContainer) {
            if ($rowData.find('.fraction-data-tab').length === 0 || $rowData.find('.denominator').hasClass('denominator-empty')) {
                if ($rowData.find('.big-parenthesis-container').length === 0) {
                    $rowContainer.addClass('only-multiplication-data-tab');
                    $rowContainer.find('.panel-row-blue-patch').addClass('adjust--blue-patch-height');
                    $rowContainer.find('.accordion-panel-content').addClass('adjust-height');

                }
                else {
                    $rowData.find('.fraction-data-tab').addClass('adjust-bottom-for-big-parenthesis');
                    $rowData.find('.close-parenthesis-data-tab, .open-parenthesis-data-tab').addClass('scale-down-size');
                    $rowData.find('.big-parenthesis-exponent-data-tab').addClass('adjust-exponent-bottom');
                }

                $rowData.find('.vincullum').hide();
                $rowData.find('.denominator').hide();
            }
        }

    }, {

        createAccordion: function createAccordion(accordionProps) {
            var accordionView = null;
            if (accordionProps) {
                accordionView = new viewNameSpace.DerivedAccordion({ el: '#' + accordionProps.containerId, options: accordionProps });
            }
            return accordionView;
        },

        ACCORDION_HEADER_ICON_CLICK: 'accordion-header-icon-click'
    });

})(window.MathInteractives);
