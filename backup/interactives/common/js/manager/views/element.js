/*jslint todo: true */
(function (MathUtilities) {
    'use strict';
    if (MathUtilities.Components.Manager.Views.ElementView) {
        return;
    }
    /**
    * View for single element model. This also handles events bound to the current view.
    * It also allows binding / unbinding of additional events to the view, and set / get its properties.
    * @module Views
    * @class ElementView
    * @constructor
    * 
    **/
    MathUtilities.Components.Manager.Views.ElementView = Backbone.View.extend({
        tagName: 'div',
        /** 
        * Initializes the view, binds listeners
        * @method initialize
        */
        initialize: function (options) {
            this.isAccessible = this.model.manager.isAccessible;
            this.accEl = options.accEl;
        },
        events: function () {
            var eventList = null;
            // Bind events for accessibility
            if (this.model.manager.isAccessible) {
                eventList = {
                    'focusin .acc-read-elem': '_toggleTooltip',
                    'focusout .acc-read-elem': '_toggleTooltip',
                    'setTitle .acc-read-elem': '_toggleTooltip',
                    'removeTitle .acc-read-elem': '_toggleTooltip',
                    'updateFocusRect': '_updateFocusRect',
                    'keypress .acc-read-elem': '_keypressHandler'
                };
            } else {
                eventList = {};
            }

            return eventList;
        },
        /**
        * Renders the view. Called by manager to set loc text. Also sets acc props if accessibility is enabled.
        * @method render
        * @return reference for the view
        **/
        render: function () {
            var templateId = MathUtilities.Components.Manager.Models.Manager.Template.DEFAULT_TEXT,
                templateSource = null,
                template = null,
                templateJSON = this.model.toJSON(),
                $contentHolder = null,
                hackDivId = '#' + this.model.get('accId') + '-acc-elem',
                html = null,
                tabIndex = this.model.get('tabIndex'),
                manager = this.model.manager,
                element = this.model,
                accId = this.model.get('accId'),
                $hackDiv = null,
                internalElements = null,
                type = element.get('type'),
                $el = this.$el,
                htmlAcc = null,
                $accEl = $(this.accEl),
                isWrapOn = element.getIsWrapOn(),
                noTextMode = manager.getNoTextMode();



            if (($el.length === 0 && $accEl.length === 0) || ($el.children('.localised-text').length !== 0 || $accEl.find(hackDivId).length !== 0)) {
                this.unload();
            }

            if (accId === null || accId === undefined) {
                this.isAccessible = false;
            }

            if ((type === 'text' || type === 'tts' || type === 'label' || type === 'editable') && !noTextMode) {
                html = MathUtilities.Components.Manager.templates.elementNoAcc(templateJSON);
                html = html.trim();
                if (this.isAccessible && type !== 'label') {
                    htmlAcc = MathUtilities.Components.Manager.templates.elementAcc(templateJSON);
                    htmlAcc = htmlAcc.trim();
                    isWrapOn = (isWrapOn === null) ? manager.getIsWrapOn() : isWrapOn;
                    if (isWrapOn) {
                        $contentHolder = $accEl.children('.math-utilities-manager-content-holder');
                        if ($contentHolder.length !== 0) {
                            internalElements = $contentHolder.children();
                            $contentHolder.replaceWith(internalElements);
                        }
                        internalElements = $accEl.children();
                        internalElements.wrapAll('<div class=math-utilities-manager-content-holder></div>');
                        $contentHolder = $accEl.children('.math-utilities-manager-content-holder');
                        $contentHolder.css({ 'position': 'relative' });
                    }
                }
                $el.prepend(html);
                $accEl.prepend(htmlAcc);
            }

            if (this.isAccessible) {
                // console.log('creating hacks');
                // alert('creating hacks');
                $hackDiv = $accEl.find(hackDivId);
                $accEl
                    .data({
                        isAccTextSame: templateJSON.isAccTextSame,
                        type: templateJSON.type,
                        title: templateJSON.message.acc,
                        tabIndex: tabIndex
                    });

                //Check for position, if no position is applied hack do not position according to parent
                if ($accEl.css('position') === 'static') {
                    $accEl.css({
                        position: 'relative'
                    });
                }
                if ($hackDiv.length !== 0) {
                    this.on('updateFocusRect', this._updateFocusRect);
                    this._updateFocusRect();
                    $hackDiv.off('keypress').on('keypress', $.proxy(this._keypressHandler, this));
                }
                if (typeof tabIndex !== 'undefined' && tabIndex !== null && tabIndex > -1) {
                    // Adding a check to see if start tab is already added or not.
                    if (this.model.get('originalTabIndex') + manager.startTab > tabIndex) {
                        element.set('tabIndex', tabIndex + manager.startTab);
                        //element.set('originalTabIndex', tabIndex + manager.startTab);
                    }
                }
                else {
                    element.set('tabIndex', -1);
                }
                this._setTabIndex();
            }
            return this;
        },
        /**
        * Renders the view again when any change in the model.
        * @method _change
        **/
        _change: function () {
            this.render();
        },
        /**
        * sets text for elements and accessible divs.
        * @method _setMessage
        * @private
        **/
        _setMessage: function () {
            var element = this.model,
                message = element.get('message'),
                $element = $('#' + element.id),
                accId = this.model.get('accId'),
                $elementAcc = $('#' + accId + '-acc-elem');
            if (element.manager.getNoTextMode()) {
                return;
            }
            $element.children('.localised-text').html(message.loc);
            $elementAcc.text(message.acc);
            $elementAcc.parent().data({ title: element.get('message').acc });
            this._updateFocusRect();
        },
        /**
        * Sets the tabindex of the hackdiv.
        * @event _setTabIndex
        **/
        _setTabIndex: function () {
            var element = this.model,
                hackDivId = '#' + this.model.get('accId') + '-acc-elem',
                tabIndex = this.model.get('tabIndex'),
                $accEl = $(this.accEl);
            $($accEl.find(hackDivId)).attr('tabindex', tabIndex);
            $accEl.data({ tabIndex: tabIndex });
            if ($($accEl.find(hackDivId)).length === 0 && this.isAccessible && element.get('type') !== 'text') {
                $accEl.attr('tabindex', tabIndex); $accEl.addClass('math-utilities-manager-access');
            }
        },
        /**
        * Sets the focus to hackdiv.
        * @event _setFocus
        **/
        _setFocus: function (event) {
            var element = this.model,
                $accEl = $(this.accEl),
                hackDivId = '#' + element.get('accId') + '-acc-elem';
            //if (element.get('isFocussed')) {
            $($accEl.find(hackDivId)).focus();
            if ($accEl.find(hackDivId).length === 0) {
                $accEl.focus(); element.set('isFocussed', true);
            }
            //}
        },
        /**
        * Triggers the click event of parent.
        * @event _keypressHandler
        * @param e {Object}
        **/
        _keypressHandler: function (event) {
            var element = this.model, key,
                $accEl = $(this.accEl),
                elemType = element.get('type'),
                mathquillTextarea = null,
                contentEditableDiv = null;

            if (elemType === 'text' || elemType === 'tts' || elemType === 'editable') {
                key = event ? event.which : event.keyCode;
                switch (key) {
                    case 13:
                    case 32:
                        event.preventDefault();
                        event.stopPropagation();
                        var events = $accEl.data('events');
                        $accEl.trigger('mousedown').trigger('mouseup').trigger('click');
                        if (elemType === 'editable') {
                            contentEditableDiv = element.get('selector');
                            if (element.get('isMathquill')) {
                                mathquillTextarea = $accEl.find('textarea');
                                if (mathquillTextarea) {
                                    mathquillTextarea.focus();
                                }
                            }
                            else if (contentEditableDiv && contentEditableDiv !== '') {
                                $accEl.find(contentEditableDiv).focus();
                            }
                        }
                        break;
                }
            }
        },

        /**
        * Update the focusrect of the element's hackdiv
        * @event _updateFocusRect
        **/
        _updateFocusRect: function () {
            // TODO : Needs Refactoring
            var element = this.model,
                hackDivId = '#' + element.get('accId') + '-acc-elem', $accEl = $(this.accEl),
                $hackDiv = $accEl.find(hackDivId),
                elementWidth = $accEl.innerWidth(),
                elementHeight = $accEl.innerHeight(),
                height = element.get('height'),
                width = element.get('width'),
                offsetTop = element.get('offsetTop'),
                offsetLeft = element.get('offsetLeft');

            if (!height) {
                height = elementHeight + offsetTop * 2;
            }
            if (!width) {
                width = elementWidth + offsetLeft * 2;
            }
            $hackDiv
                .addClass('math-utilities-manager-access')
                .css({
                    width: width,
                    height: height,
                    top: (elementHeight - height) / 2,
                    left: (elementWidth - width) / 2
                });
            return this;
        },

        unload: function () {
            var $accEl = $(this.accEl),
                $contentHolder = $accEl.children('.math-utilities-manager-content-holder'),
                internalElements = null;
            $accEl.children('.acc-read-elem').remove();
            $accEl.removeAttr('tabindex');
            this.$el.children('.localised-text').remove();
            if ($contentHolder.length !== 0) {
                internalElements = $contentHolder.children();
                $contentHolder.replaceWith(internalElements);
            }
        },
        /**
        * Toggles the elements tooltip based on the event type
        * @event _toggleToolTip
        * @param event {Object}
        **/
        _toggleTooltip: function (event) {
            var eventType = event.type,
                self = this.$el,
                element = this.model,
                hackDiv = $('#' + element.get('accId') + '-acc-elem'),
                tooltip = self.data('title'),
                manager = this.model.manager, debug = manager.get('debug'),
                $accEl = $(this.accEl);
            if ($(event.currentTarget).parent(self).length === 0) {
                return;
            }
            switch (eventType) {
                case 'focusin':
                    this.model.set('isFocussed', true);
                    hackDiv.attr('aria-label', tooltip);
                    $accEl.trigger('mouseenter');
                    if (debug && typeof console !== 'undefined' && typeof console.log !== 'undefined') {
                        console.log('Log: accId: ' + element.get('accId') + ' :: tabIndex: ' + element.get('tabIndex') + ' :: accText: ', tooltip);
                    }
                    break;
                case 'setTitle':
                    hackDiv.attr('aria-label', tooltip);
                    break;
                case 'focusout':
                    this.model.set('isFocussed', false);
                    hackDiv.removeAttr('aria-label');
                    $accEl.trigger('mouseout').trigger('mouseleave');
                    break;
                case 'removeTitle':
                    hackDiv.removeAttr('aria-label');
                    break;
            }
        },
        /**
        * Default mouseenter handler. Triggers the removeTitle event.
        * @method getTabIndex
        * @return {Number} Returns the tabindex of element. 
        **/
        getTabIndex: function () {
            return this.model.get('tabIndex');
        },
        /**
        * Default mouseenter handler. Triggers the removeTitle event.
        * @method setTabIndex
        * @param tabIndex New tabindex of element.
        **/
        setTabIndex: function (tabIndex) {
            this.model.set('tabIndex', tabIndex);
        },
        /**
        * Default mouseenter handler. Triggers the removeTitle event.
        * @method bindEvent
        * @param eventType {String} Type of event.
        * @param handler {Function} Listener to an event.
        * @param instanceReference
        **/
        bindEvent: function (eventType, handler, instanceReference) {
            this.on(eventType, handler, instanceReference);
        },
        /**
        * Default mouseenter handler. Triggers the removeTitle event.
        * @method unbindEvent
        * @param eventType Type of event.
        * @param handler {Function} Listener to an event.
        **/
        unbindEvent: function (eventType, handler) {
            this.off(eventType, handler);
        }
    });
}(window.MathUtilities));
