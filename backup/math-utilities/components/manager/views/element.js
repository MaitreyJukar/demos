/* globals $, window */

/*jslint todo: true */
(function(MathUtilities) {
    "use strict";
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
        "tagName": "div",
        /**
         * Initializes the view, binds listeners
         * @method initialize
         */
        "initialize": function(options) {
            this.isAccessible = this.model.manager.isAccessible;
            this.accEl = options.accEl;
        },
        "events": function() {
            var eventList = {};
            // Bind events for accessibility
            if (this.model.manager.isAccessible) {
                eventList = {
                    "focusin .acc-read-elem": "_toggleTooltip",
                    "focusout .acc-read-elem": "_toggleTooltip",
                    "setTitle .acc-read-elem": "_toggleTooltip",
                    "removeTitle .acc-read-elem": "_toggleTooltip",
                    "updateFocusRect": "_updateFocusRect",
                    "keypress .acc-read-elem": "_keypressHandler"
                };
            }
            return eventList;
        },
        /**
         * Renders the view. Called by manager to set loc text. Also sets acc props if accessibility is enabled.
         * @method render
         * @return reference for the view
         **/
        "render": function() {
            var templateJSON = this.model.toJSON(),
                $contentHolder = null,
                hackDivId = "#" + this.model.get("accId") + "-acc-elem",
                html = null,
                tabIndex = this.model.get("tabIndex"),
                manager = this.model.manager,
                element = this.model,
                accId = this.model.get("accId"),
                $hackDiv = null,
                internalElements = null,
                type = element.get("type"),
                $el = this.$el,
                htmlAcc = null,
                $accEl = $(this.accEl),
                isWrapOn = element.get("isWrapOn"),
                noTextMode = manager.get("noTextMode");



            if (($el.length === 0 && $accEl.length === 0) ||
                ($el.children(".localised-text").length !== 0 ||
                    $accEl.find(hackDivId).length !== 0)) {

                this.unload();
            }

            if (accId === null || typeof accId === "undefined") {
                this.isAccessible = false;
            }

            if (["text", "tts", "label", "editable"].indexOf(type) > -1 && !noTextMode) {
                html = MathUtilities.Components.Manager.templates.elementNoAcc(templateJSON);
                html = html.trim();
                if (this.isAccessible && type !== "label") {
                    htmlAcc = MathUtilities.Components.Manager.templates.elementAcc(templateJSON);
                    htmlAcc = htmlAcc.trim();
                    isWrapOn = (isWrapOn === null) ? manager.getIsWrapOn() : isWrapOn;

                    if (isWrapOn) {
                        $contentHolder = $accEl.children(".math-utilities-manager-content-holder");
                        if ($contentHolder.length !== 0) {
                            internalElements = $contentHolder.children();
                            $contentHolder.replaceWith(internalElements);
                        }
                        internalElements = $accEl.children();
                        internalElements.wrapAll("<div class=math-utilities-manager-content-holder></div>");
                        $contentHolder = $accEl.children(".math-utilities-manager-content-holder");
                        $contentHolder.css({
                            "position": "relative"
                        });
                    }
                }
                $el.prepend(html);
                $accEl.prepend(htmlAcc);
            }

            if (this.isAccessible) {
                $hackDiv = $accEl.find(hackDivId);
                $accEl.data({
                    "isAccTextSame": templateJSON.isAccTextSame,
                    "type": templateJSON.type,
                    "title": templateJSON.message.acc,
                    "tabIndex": tabIndex,
                    "tempTabIndex": tabIndex
                });

                //Check for position, if no position is applied hack do not position according to parent
                if ($accEl.css("position") === "static") {
                    $accEl.css({
                        "position": "relative"
                    });
                }
                if ($hackDiv.length !== 0) {
                    this.on("updateFocusRect", this._updateFocusRect);
                    this._updateFocusRect();
                    $hackDiv.off("keypress").on("keypress", $.proxy(this._keypressHandler, this));
                }
                if (tabIndex !== null && tabIndex > -1) {
                    // Adding a check to see if start tab is already added or not.
                    if (this.model.get("originalTabIndex") + manager.startTab > tabIndex) {
                        element.set({
                            "tabIndex": tabIndex + manager.startTab,
                            "tempTabIndex": tabIndex + manager.startTab
                        });
                    }
                } else {
                    element.set({
                        "tabIndex": -1,
                        "tempTabIndex": -1
                    });
                }
                this.setTabIndex();
            }
            return this;
        },
        /**
         * Returns true if focus is inside the interactivity
         * @method _checkInsideInteractivity
         **/
        "_checkInsideInteractivity": function() {
            // if focus is not inside the activity, tabindex and focus should not be set from activity calls
            if (this.model.manager.get("insideInteractivity") === null) {
                // Returns true when accessibility components are not initialized
                return true;
            }
            return this.model.manager.get("insideInteractivity");
        },
        /**
         * sets text for elements and accessible divs.
         * @method setMessage
         * @public
         **/
        "setMessage": function() {
            var element = this.model,
                message = element.get("message"),
                $element = $("#" + element.id),
                accId = this.model.get("accId"),
                $elementAcc = $("#" + accId + "-acc-elem");
            if (element.manager.get("noTextMode")) {
                return;
            }
            $element.children(".localised-text").html(message.loc);
            $elementAcc.text(message.acc);
            $elementAcc.parent().data({
                "title": element.get("message").acc
            });
            this._updateFocusRect();
        },
        /**
         * Sets the tabindex of the hackdiv.
         * @method setTabIndex
         * @public
         **/
        "setTabIndex": function() {
            var element = this.model,
                hackDivId = "#" + this.model.get("accId") + "-acc-elem",
                tabIndex = this.model.get("tabIndex"),
                tempTabIndex = tabIndex,
                $accEl = $(this.accEl),
                insideInteractivity = this._checkInsideInteractivity(),
                $accDiv = $accEl.find(hackDivId);

            if (!insideInteractivity) {
                tabIndex = -1;
            }


            $accEl.data({
                "tabIndex": tabIndex,
                "tempTabIndex": tempTabIndex
            });

            if ($accDiv.length === 0 && this.isAccessible && element.get("type") !== "text") {

                $accEl.attr("temptabindex", tempTabIndex)
                    .attr("tabindex", tabIndex)
                    .addClass("math-utilities-manager-access");
            } else {
                $accDiv.attr("temptabindex", tempTabIndex).attr("tabindex", tabIndex);
            }
        },
        /**
         * Sets the focus to hackdiv.
         * @method setFocus
         * @public
         **/
        "setFocus": function(event) {
            var element = this.model,
                $accEl = $(this.accEl),
                hackDivId = "#" + element.get("accId") + "-acc-elem",
                insideInteractivity = this._checkInsideInteractivity();

            if (!insideInteractivity) {
                return null;
            }
            $accEl.find(hackDivId).focus();
            if ($accEl.find(hackDivId).length === 0) {
                $accEl.focus();
                element.set("isFocussed", true);
            }

        },
        /**
         * Triggers the click event of parent.
         * @method _keypressHandler
         * @param e {Object}
         **/
        "_keypressHandler": function(event) {
            var element = this.model,
                key,
                $accEl = $(this.accEl),
                elemType = element.get("type"),
                mathquillTextarea = null,
                contentEditableDiv = null;

            if (["text", "tts", "editable"].indexOf(elemType) > -1) {
                key = event ? event.which : event.keyCode;
                switch (key) {
                    case 13:
                    case 32:
                        event.preventDefault();
                        event.stopPropagation();
                        $accEl.trigger("mousedown").trigger("mouseup").trigger("click");
                        if (elemType === "editable") {
                            contentEditableDiv = element.get("selector");
                            if (element.get("isMathquill")) {
                                mathquillTextarea = $accEl.find("textarea");
                                if (mathquillTextarea) {
                                    mathquillTextarea.focus();
                                }
                            } else if (contentEditableDiv && contentEditableDiv !== "") {
                                $accEl.find(contentEditableDiv).focus();
                            }
                        }
                        break;
                }
            }
        },

        /**
         * Update the focusrect of the element's hackdiv
         * @method _updateFocusRect
         **/
        "_updateFocusRect": function() {
            var element = this.model,
                hackDivId = "#" + element.get("accId") + "-acc-elem",
                $accEl = $(this.accEl),
                $hackDiv = $accEl.find(hackDivId),
                elementWidth = $accEl.innerWidth(),
                elementHeight = $accEl.innerHeight(),
                height = element.get("height"),
                width = element.get("width"),
                offsetTop = element.get("offsetTop"),
                offsetLeft = element.get("offsetLeft");

            if (height === null) {
                height = elementHeight + offsetTop * 2;
            }
            if (width === null) {
                width = elementWidth + offsetLeft * 2;
            }
            $hackDiv
                .addClass("math-utilities-manager-access")
                .css({
                    "width": width,
                    "height": height,
                    "top": (elementHeight - height) / 2,
                    "left": (elementWidth - width) / 2
                });
            return this;
        },
        /**
         * Unloads the element.
         * @method unload
         **/
        "unload": function() {
            var $accEl = $(this.accEl),
                $contentHolder = $accEl.children(".math-utilities-manager-content-holder"),
                internalElements = null;
            $accEl.children(".acc-read-elem").remove();
            $accEl.removeAttr("tabindex");
            $accEl.removeAttr("temptabindex");
            this.$el.children(".localised-text").remove();
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
        "_toggleTooltip": function(event) {
            var $el = this.$el;
            if ($(event.currentTarget).parent($el).length === 0) {
                return;
            }

            var eventType = event.type,
                element = this.model,
                hackDiv = $("#" + element.get("accId") + "-acc-elem"),
                tooltip = $el.data("title"),
                $accEl = $(this.accEl);

            switch (eventType) {
                case "focusin":
                    this.model.set("isFocussed", true);
                    hackDiv.attr("aria-label", tooltip);
                    $accEl.trigger("mouseenter");
                    break;
                case "setTitle":
                    hackDiv.attr("aria-label", tooltip);
                    break;
                case "focusout":
                    this.model.set("isFocussed", false);
                    hackDiv.removeAttr("aria-label");
                    $accEl.trigger("mouseout").trigger("mouseleave");
                    break;
                case "removeTitle":
                    hackDiv.removeAttr("aria-label");
                    break;
            }
        },

        /**
         * Default mouseenter handler. Triggers the removeTitle event.
         * @method bindEvent
         * @param eventType {String} Type of event.
         * @param handler {Function} Listener to an event.
         * @param instanceReference
         **/
        "bindEvent": function(eventType, handler, instanceReference) {
            this.on(eventType, handler, instanceReference);
        },

        /**
         * Default mouseenter handler. Triggers the removeTitle event.
         * @method unbindEvent
         * @param eventType Type of event.
         * @param handler {Function} Listener to an event.
         **/
        "unbindEvent": function(eventType, handler) {
            this.off(eventType, handler);
        }
    });
}(window.MathUtilities));
