/* globals _, window, $ */

(function(MathUtilities) {
    "use strict";

    /*Chcek for MathUtilities and MathUtilities.Components */
    if (_.isUndefined(MathUtilities)) {
        MathUtilities = window.MathUtilities = {};
    }

    if (_.isUndefined(MathUtilities.Components)) {
        MathUtilities.Components = {};
    }

    var Manager = MathUtilities.Components.Manager;

    if (Manager &&
        Manager.Models &&
        Manager.Views &&
        Manager.Collections &&
        Manager.Views.Manager) {
        return;
    }
    /* Initialize MathUtilities Data */
    /**
     * Packages all the classes used in the manager module.
     * @module Manager
     * @namespace MathUtilites.Components
     **/
    MathUtilities.Components.Manager = {};

    /**
     * Packages all the models used in the manager module.
     * @module Models
     * @namespace MathUtilites.Components.Manager
     **/
    MathUtilities.Components.Manager.Models = {};

    /**
     * Packages all the views used in the manager module.
     * @module Views
     * @namespace MathUtilites.Components.Manager
     **/
    MathUtilities.Components.Manager.Views = {};

    /**
     * Packages all the collections used in the manager module.
     * @module Collections
     * @namespace MathUtilites.Components.Manager
     **/
    MathUtilities.Components.Manager.Collections = {};



    /**
     *
     * @class MathUtilities.Components.Manager.Views.Manager
     * @extends Backbone.VIew
     * @constructor
     **/
    MathUtilities.Components.Manager.Views.Manager = Backbone.View.extend({
        "el": "body",
        "initialize": function() {
            if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                this.model.isAccessible = false;
                this.model.set("isAccessible", false);
            }
        },


        "renderElements": function(screenId, uniqueId, containerId) {
            var elements = this.model.nodes.get(screenId).elements,
                screen = this.model.screens[screenId] = {},
                elementViews = this.model.elementViews || {},
                elementId = null,
                accId = null,
                elementNode = null,
                accMessage,
                newElementId = null,
                tabIndex = null,
                dummyElement = null,
                elementView = null,
                newAccId = null,
                accElementNode = null,
                $context = containerId ? $("#" + containerId) : this.$el;

            _.each(elements.models, function(element) {
                accId = element.get("accId");
                accMessage = element.message.acc;
                elementId = element.get("id");
                newElementId = elementId;
                newAccId = accId;
                tabIndex = element.get("tabIndex");
                if ((tabIndex !== null || (accMessage !== null && typeof accMessage !== "undefined")) && accId === null) {

                    accId = elementId;
                    element.set("accId", accId);
                    this.model.elementsByAccId[accId] = element;

                }
                element.manager.isAccessible = this.model.isAccessible;

                if (uniqueId) {
                    dummyElement = element.clone();
                    dummyElement.manager = this.model;
                    dummyElement.manager.isAccessible = this.model.isAccessible;
                    dummyElement.set("id", uniqueId + element.get("id"));
                    dummyElement.id = dummyElement.get("id");
                    if (accId !== null) {
                        dummyElement.set("accId", uniqueId + accId);
                        newAccId = uniqueId + accId;
                    }
                    newElementId = dummyElement.get("id");
                    elementNode = $context.find("#" + newElementId);
                    accElementNode = (elementId === accId) ? elementNode : $context.find("#" + dummyElement.get("accId"));
                    this.model.elementsById[newElementId] = dummyElement;
                    this.model.elementsByAccId[dummyElement.get("accId")] = dummyElement;
                } else {
                    elementNode = $context.find("#" + elementId);
                    accElementNode = (elementId === accId) ? elementNode : $context.find("#" + accId);
                    dummyElement = element;
                }
                elementView = new MathUtilities.Components.Manager.Views.ElementView({
                    "el": elementNode,
                    "model": dummyElement,
                    "accEl": accElementNode
                });
                elementViews[newElementId] = elementView;
                screen[newElementId] = elementView;
                if (newAccId !== null) {
                    elementViews[newAccId] = elementView;
                }
                elementView.render();
            }, this);

        },
        /**
         * creates accessible div for specified element.
         * @method createAccDiv
         * @param obj {Object} Element Id of required element.
         **/
        "createAccDiv": function(obj) {
            var elementId = obj.elementId,
                i = 0,
                type = obj.type || "text",
                uniqueId = obj.uniqueId,
                tabIndex = obj.tabIndex,
                templateJson = {
                    "id": elementId,
                    "type": type,
                    "accId": elementId,
                    "role": obj.role,
                    "selector": obj.selector,
                    "isMathquill": obj.isMathquill,
                    "offsetTop": obj.offsetTop,
                    "offsetLeft": obj.offsetLeft,
                    "tabIndex": tabIndex,
                    "originalTabIndex": tabIndex,
                    "isWrapOn": obj.isWrapOn,
                    "messages": [{
                        "message": {
                            "loc": obj.loc,
                            "acc": obj.acc
                        }
                    }]
                },
                elementView, elements, accScreen;
            if (!elementId) {
                return;
            }

            accScreen = this.model.get("accScreen");
            if (uniqueId) {
                elementId = uniqueId + elementId;
                templateJson.accId = uniqueId + templateJson.accId;
                templateJson.id = elementId;
            }
            if (tabIndex !== null && typeof tabIndex !== "undefined") {
                templateJson.tabIndex = tabIndex + this.model.startTab;
                templateJson.originalTabIndex = tabIndex;
            }
            elements = accScreen[0].elements;
            for (i = 0; i < elements.length; i++) {
                if (elementId === elements[i].id) {
                    $.extend(elements[i], templateJson);
                    elements.splice(i, 1);
                    break;
                }
            }
            accScreen[0].elements.push(templateJson);

            this.model.parse(accScreen);
            elementView = new MathUtilities.Components.Manager.Views.ElementView({
                "el": "#" + elementId,
                "model": this.model.elementsByAccId[elementId],
                "accEl": "#" + elementId
            });
            this.model.elementViews[elementId] = elementView;
            elementView.render();
        },
        /**
         * sets size of acc div equal to elements size.
         * @method restrictAccDivSize
         * @param accId
         **/
        "restrictAccDivSize": function(accId) {
            var elementModel = this._checkElementExistsByAccId(accId),
                $element = $("#" + accId);

            if (elementModel === null) {
                return;
            }

            $element.find("#" + accId + "-acc-elem").css({
                "width": $element.innerWidth(),
                "height": $element.innerHeight(),
                "top": 0,
                "left": 0
            });
        },
        /**
         * sets acc and loc message for element.
         * @method setLocAccMessage
         * @param id {String} Element Id of required element.
         * @param messageArray {Array} Message array.
         **/
        "setLocAccMessage": function(id, messageArray) {
            if (messageArray === null) {
                return;
            }
            this.setMessage(id, messageArray[0]);
            this.setAccMessage(id, messageArray[1]);
        },

        /**
         * Checks if the element exists in the managers' elements collection.
         * @method _checkElementExists
         * @private
         * @param elementId {String} Id of the required element
         * @return {Boolean|Object} Returns false if element is not found.
         *                          Returns element's model if element is found.
         **/
        "_checkElementExists": function(elementId) {
            var elementModel = this.model.elementsById[elementId];

            if (typeof elementModel === "undefined") {
                return false;
            }
            return elementModel;
        },
        /**
         * Checks if the message exists in the elements model.
         * @method _checkMessageExists
         * @private
         * @param elementModel {Object} a valid messageModel
         * @param messageId {Number} MessageId of the required message node
         * @return {Boolean | Object} Returns false if node with provided messageId is not found.
         *         Returns messageNode if a matching node is found.
         **/
        "_checkMessageExists": function(elementModel, messageId) {
            var messageNode = elementModel.messages.get(messageId);
            if (typeof messageNode === "undefined") {
                return false;
            }
            return messageNode;
        },
        /**
         * Checks if the element with the elementId exists. Also checks if there exists a message
         * with the provided messageId if the element is found.
         * @method _validateElementMessage
         * @private
         * @param elementId {String} Id of the required elementNode
         * @param messageId {String} Id of the required messageNode
         * @return {Boolean|Object} Returns false if no element matches the provided elementId, or no message node
         *         exists with the provided messageId. Returns an object with the elementModel and
         *         messageNode if matching element model and message node are found.
         **/
        "_validateElementMessage": function(elementId, messageId) {
            var elementModel = this._checkElementExists(elementId),
                messageNode = null;
            //elementModel can be object or it can be false. =
            if (elementModel === false) {
                return false;
            }
            messageNode = this._checkMessageExists(elementModel, messageId);
            //messageNode can be object or it can be false.
            if (messageNode === false) {
                return false;
            }
            return {
                "elementModel": elementModel,
                "messageNode": messageNode
            };
        },
        /**
         * Fetches the localization message from the elements model.
         * @method getMessage
         * @param elementId {String} Element Id of required element.
         * @param messageId {String} Message Id of required message node.
         * @return {String} Returns null if element or message is not found.
         *         Returns the loc message if element and message node is found.
         **/
        "getMessage": function(elementId, messageId, arrParam) {
            var result = this._validateElementMessage(elementId, messageId),
                messageNode = null,
                locMessage = null;
            //result can be object or it can be false.
            if (result === false) {
                return null;
            }

            if (this.model.get("noTextMode")) {
                return "";
            }

            messageNode = result.messageNode;
            locMessage = messageNode.message.loc;
            if (typeof arrParam !== "undefined") {
                locMessage = this._replaceSpecialStr(locMessage, arrParam);
            }
            return locMessage;
        },
        /**
         * Replaces the '%@$%' in given message with strings in the given array.
         * @method _replaceSpecialStr
         * @private
         * @param message {String} Message which is to be modified.
         * @param arrParam Array of strings.
         * @return {String} Returns The modified message removing'%@$%'.
         **/
        "_replaceSpecialStr": function(message, arrParam) {
            var i = 0;
            for (; i < arrParam.length; i++) {
                message = message.replace("%@$%", arrParam[i]);
            }
            return message;
        },
        /**
         * Changes the loc message for element.
         * @method changeMessage
         * @param elementId {String} Element id of required element.
         * @param messageId {String} Message id of the required message
         **/
        "changeMessage": function(elementId, messageId, arrParam) {
            var result = this._validateElementMessage(elementId, messageId),
                elementModel = null,
                currentMessage = null;
            //result can be object or it can be false.
            if (result === false) {
                return;
            }

            elementModel = result.elementModel;
            currentMessage = $.extend({}, elementModel.get("message"));
            currentMessage.loc = result.messageNode.message.loc;
            if (typeof arrParam !== "undefined") {
                currentMessage.loc = this._replaceSpecialStr(currentMessage.loc, arrParam);
            }

            elementModel.set("message", currentMessage);
            this.model.elementViews[elementId].setMessage();
        },

        /**
         * Sets the selector for element.
         * @method changeSelector
         * @param accId {String} Element id of required element.
         * @param selector {String} Selector onto which focus is to be set.
         **/
        "setSelector": function(accId, selector) {
            var elementModel = this._checkElementExistsByAccId(accId);
            //elementModel can be object or it can be false.
            if (elementModel === false) {
                return;
            }
            if (selector && selector !== "") {
                elementModel.set("selector", selector);
                this._updateAccScreen(accId, "selector", selector);
            }
        },

        /**
         * Returns the selector for element.
         * @method getSelector
         * @param accId {String} Element id of required element.
         **/
        "getSelector": function(accId) {
            var elementModel = this._checkElementExistsByAccId(accId);

            return elementModel && elementModel.get("selector") || null;
        },

        /**
         * Sets the type for element.
         * @method setType
         * @param accId {String} Element id of required element.
         * @param type {String} type of required element.
         **/
        "setType": function(accId, type) {
            var elementModel = this._checkElementExistsByAccId(accId);
            //elementModel can be object or it can be false.
            if (elementModel === false) {
                return null;
            }
            if (type) {
                elementModel.set("type", type);
                this._updateAccScreen(accId, "type", type);
            }
        },

        /**
         * Returns the type for element.
         * @method getType
         * @param accId {String} Element id of required element.
         **/
        "getType": function(accId) {
            var elementModel = this._checkElementExistsByAccId(accId);

            return elementModel && elementModel.get("type") || null;
        },

        /**
         * Sets whether required element is mathquill.
         * @method setIsMathquill
         * @param accId {String} Element id of required element.
         * @param isMathquill {String} if required element is mathquill.
         **/
        "setIsMathquill": function(accId, isMathquill) {
            var elementModel = this._checkElementExistsByAccId(accId);
            //elementModel can be object or it can be false.
            if (elementModel === false) {
                return;
            }
            if (_.isBoolean(isMathquill)) {
                elementModel.set("isMathquill", isMathquill);
                this._updateAccScreen(accId, "isMathquill", isMathquill);
            }
        },

        /**
         * Returns the type for element.
         * @method getType
         * @param accId {String} Element id of required element.
         **/
        "getIsMathquill": function(accId) {
            var elementModel = this._checkElementExistsByAccId(accId);

            return elementModel && elementModel.get("isMathquill") || null;
        },

        /**
         * Sets the loc message for element.
         * @method setMessage
         * @param elementId {String} Element id of required element.
         * @param message {String} Localized message string
         **/
        "setMessage": function(elementId, message, arrParam) {
            var elementModel = this._checkElementExists(elementId),
                messageNode = null;
            //elementModel can be object or it can be false.
            if (elementModel === false) {
                return;
            }
            messageNode = elementModel.message;
            if (typeof arrParam !== "undefined") {
                message = this._replaceSpecialStr(message, arrParam);
            }
            messageNode.loc = message;
            elementModel.set("message", messageNode);
            this.model.elementViews[elementId].setMessage();

            this._updateAccScreenMessageData(elementId, messageNode);
        },

        /*
         * Update Acc Screen elements message nodes
         * @method _updateAccScreenMessageData
         * @param {String} elementId
         * @param {object} messageNode
         * @private
         */
        "_updateAccScreenMessageData": function(elementId, messageNode) {
            var accScreenElements = this.model.get("accScreen")[0].elements,
                elementIndex,
                currentElement = null;

            //_.each has not been used as we need to return from function when match is found.
            for (elementIndex in accScreenElements) {
                currentElement = accScreenElements[elementIndex];
                if (currentElement.hasOwnProperty(elementId)) {
                    currentElement.messages[0].message = messageNode;
                    return;
                }
            }
        },

        "_updateAccScreen": function(elementId, type, value) {
            var accScreenElements = this.model.get("accScreen")[0].elements,
                elementIndex,
                currentElement = null;
            //_.each has not been used as we need to return from function when match is found.
            for (elementIndex in accScreenElements) {
                currentElement = accScreenElements[elementIndex];
                if (currentElement.hasOwnProperty(elementId)) {
                    currentElement[type] = value;
                    return;
                }
            }
        },

        /**
         * Loads the required screen.
         * @method loadScreen
         * @param screenId {String} Id of required screen.
         **/
        "loadScreen": function(screenId, uniqueId, containerId) {
            this.renderElements(screenId, uniqueId, containerId);
        },

        /**
         * Unload the screen.
         * @method unloadScreen.
         * @param screenId {String} Id of required screen.
         * @param uniqueId {String} UniqueId of required screen.
         **/
        "unloadScreen": function(screenId, uniqueId, containerId) {
            var elements = this.model.nodes.get(screenId).elements,
                accId = null,
                elementId = null,
                $context = containerId ? $("#" + containerId) : this.$el;

            _.each(elements.models, function(element) {
                elementId = element.get("id");
                accId = element.get("accId");
                if (uniqueId) {
                    elementId = uniqueId + element.get("id");
                    if (accId !== null) {
                        accId = uniqueId + element.get("accId");
                    }
                }
                if (this.model.elementViews[elementId] &&
                    $context.find("#" + elementId).length > 0) {
                    element.set("tabIndex", element.get("originalTabIndex"));
                    this.model.elementViews[elementId].unload();
                    delete this.model.elementViews[elementId];
                    delete this.model.elementViews[accId];
                }
            }, this);

        },
        /**
         * Checks if the element exists in the managers' elements collection.
         * @method _checkElementExistsByAccId
         * @private
         * @param accId {String} Id of the required element
         * @return {Boolean | Object} Returns false if element is not found.
         *         Returns element's model if element is found.
         **/
        "_checkElementExistsByAccId": function(accId) {
            var elementModel = this.model.elementsByAccId[accId];
            if (typeof elementModel === "undefined") {
                return false;
            }
            return elementModel;
        },
        /**
         * Fetches the tabIndex from the elements model.
         * @method getTabIndex
         * @param strAccId Element acdcId of required element.
         * @return {Number} Returns null if element is not found.
         *         Returns the tabIndex if element is found.
         **/
        "getTabIndex": function(strAccId) {
            var elementModel = this._checkElementExistsByAccId(strAccId);
            //elementModel can be object or it can be false.
            if (elementModel === false) {
                return null;
            }
            return elementModel.get("originalTabIndex");
        },
        /**
         * Sets the tabIndex for element.
         * @method setTabIndex
         * @param elementId {Object} Element accId of required element.
         * @param newTabIndex {Number} new value of tabIndex
         **/
        "setTabIndex": function(strAccId, newTabIndex) {
            var elementModel = this._checkElementExistsByAccId(strAccId);
            //elementModel can be object or it can be false.
            if (elementModel === false) {
                return;
            }

            elementModel.set({
                "tabIndex": this.model.startTab + newTabIndex,
                "originalTabIndex": newTabIndex
            });

            this.model.elementViews[strAccId].setTabIndex();
            this._updateAccScreen(strAccId, "tabIndex", newTabIndex);
        },
        /**
         * Checks if the element with the accId exists. Also checks if there exists a message
         * with the provided messageId if the element is found.
         * @method _validateElementMessageByAccId
         * @param accId {String} Id of the required elementNode
         * @param messageId {Object} Id of the required messageNode
         * @return {Boolean | Object} Returns false if no element matches the provided accId, or no message node
         *         exists with the provided messageId.Returns an object with the elementModel and
         *         messageNode if matching element model and message node are found.
         **/
        "_validateElementMessageByAccId": function(accId, messageId) {
            var elementModel = this._checkElementExistsByAccId(accId),
                messageNode = null;
            //elementModel can be object or it can be false.
            if (elementModel === false) {
                return false;
            }
            messageNode = this._checkMessageExists(elementModel, messageId);
            //messageNode can be object or it can be false.
            if (messageNode === false) {
                return false;
            }
            return {
                "elementModel": elementModel,
                "messageNode": messageNode
            };
        },
        /**
         * Changes the acc message for element.
         * @method changeAccMessage
         * @param accId {String} of required element.
         * @param messageId {String} of the required message
         **/
        "changeAccMessage": function(accId, messageId, arrParam) {
            if (!this.model.isAccessible) {
                return;
            }
            //result can be object or it can be false.
            var result = this._validateElementMessageByAccId(accId, messageId),
                elementModel = null,
                currentMessage = null;

            if (result === false) {
                return;
            }

            elementModel = result.elementModel;
            currentMessage = $.extend({}, elementModel.get("message"));
            currentMessage.acc = result.messageNode.message.acc;

            if (typeof arrParam !== "undefined") {
                currentMessage.acc = this._replaceSpecialStr(currentMessage.acc, arrParam);
            }

            elementModel.set("message", currentMessage);
            this.model.elementViews[accId].setMessage();
        },
        /**
         * Sets the acc message for element.
         * @method setAccMessage
         * @param accId {String} of required element.
         * @param message {String} accessible message string
         **/
        "setAccMessage": function(accId, message, arrParam) {
            var elementModel = this._checkElementExistsByAccId(accId),
                messageNode = null;
            //elementModel can be object or it can be false.
            if (elementModel === false) {
                return null;
            }

            messageNode = elementModel.message;
            if (typeof arrParam !== "undefined") {
                message = this._replaceSpecialStr(message, arrParam);
            }
            messageNode.acc = message;
            elementModel.set("message", messageNode);
            this.model.elementViews[accId].setMessage();

            this._updateAccScreenMessageData(accId, messageNode);
        },
        /**
         * Fetches the accessible message from the elements model.
         * @method getAccMessage
         * @param accId {String} of required element.
         * @param messageId {String} Message Id of required message node.
         * @return {String} Returns null if element or message is not found.
         *         Returns the acc message if element and message node is found.
         **/
        "getAccMessage": function(accId, messageId, arrParam) {

            var result = null,
                messageNode = null,
                accMessage = null;

            result = this._validateElementMessageByAccId(accId, messageId);
            //result can be object or it can be false.
            if (result === false) {
                return null;
            }

            if (this.model.get("noTextMode")) {
                return "";
            }
            messageNode = result.messageNode;
            accMessage = messageNode.message.acc;
            if (typeof arrParam !== "undefined") {
                accMessage = this._replaceSpecialStr(accMessage, arrParam);
            }
            return accMessage;
        },
        /**
         * Sets the acc message for element.
         * @method setFocus
         * @param accId {String} of required element.
         **/
        "setFocus": function(accId, delay) {
            // no accessibility for touch devices.
            var supportsTouch = MathUtilities.Components.Utils.Models.BrowserCheck.isMobile,
                elementModel = this._checkElementExistsByAccId(accId),
                elementId = null,
                elementView = this.model.elementViews;

            if (supportsTouch || elementModel === false) {
                return;
            }
            elementId = elementModel.id;
            if (delay === null || typeof delay === "undefined") {
                elementView[elementId].setFocus();
            } else {
                setTimeout(function() {
                    elementView[elementId].setFocus();
                }, delay);
            }
        },

        "_focusOutHandlerArray": {},
        /**
         * Adds the listener for focusout event.
         * @method focusOut
         * @param accId {String} of required element.
         * @param focusOutHandler {Function} Listener which is to be added for focusout event.
         * @param delay {Number} Time delay after which added listener is executed.
         * @param addOrRemove {Boolean} It tells whether given listener is to be added or removed.
         **/
        "focusOut": function(accId, focusOutHandler, delay, addOrRemove) {
            var elementModel = this._checkElementExistsByAccId(accId),
                focusOutHandlerArray = this._focusOutHandlerArray[accId],
                $hackDiv = $("#" + accId + "-acc-elem"),
                data = null,
                handlerLength = null,
                i = 0;
            if (elementModel === false) {
                return;
            }

            delay = delay || 0;

            function handler() {
                var self = this;
                setTimeout(function() {
                    focusOutHandler.call(self);
                }, delay);
            }

            if (typeof addOrRemove === "undefined" || addOrRemove === true) {
                $hackDiv.on("focusout", $.proxy(handler, $hackDiv));
                data = {
                    "focusOutHandler": focusOutHandler,
                    "handler": handler
                };
                focusOutHandlerArray = focusOutHandlerArray || [];
                handlerLength = focusOutHandlerArray.length;
                focusOutHandlerArray[handlerLength] = data;
            }
            if (addOrRemove === false) {
                handlerLength = focusOutHandlerArray ? focusOutHandlerArray.length : 0;
                for (i = 0; i < handlerLength; i++) {
                    if (focusOutHandlerArray[i].focusOutHandler === focusOutHandler) {
                        $hackDiv.off("focusout", focusOutHandlerArray[i].handler);
                        focusOutHandlerArray.splice(i, 1);
                        break;
                    }
                }
            }
            this._focusOutHandlerArray[accId] = focusOutHandlerArray;
        },

        "_focusInHandlerArray": {},
        /**
         * Adds the listener for focusin event.
         * @method focusIn
         * @param accId {String} of required element.
         * @param focusInHandler {Function} Listener which is to be added for focusin event.
         * @param delay {Number} Time delay after which added listener is executed.
         * @param addOrRemove {Boolean} It tells whether given listener is to be added or removed.
         **/
        "focusIn": function(accId, focusInHandler, delay, addOrRemove) {
            var elementModel = this._checkElementExists(accId),
                focusInHandlerArray = this._focusInHandlerArray[accId],
                $hackDiv = $("#" + accId + "-acc-elem"),
                data = null,
                handlerLength = null,
                i = 0;
            if (elementModel === false) {
                return;
            }

            delay = delay || 0;

            function handler() {
                var self = this;
                setTimeout(function() {
                    focusInHandler.call(self);
                }, delay);
            }
            if (addOrRemove === true || typeof addOrRemove === "undefined") {
                $hackDiv.on("focusin", $.proxy(handler, $hackDiv));
                data = {
                    "focusInHandler": focusInHandler,
                    "handler": handler
                };
                focusInHandlerArray = focusInHandlerArray || [];
                handlerLength = focusInHandlerArray.length;
                focusInHandlerArray[handlerLength] = data;

            }
            if (addOrRemove === false) {
                handlerLength = focusInHandlerArray ? focusInHandlerArray.length : 0;
                for (i = 0; i < handlerLength; i++) {

                    if (focusInHandlerArray[i].focusInHandler === focusInHandler) {
                        $hackDiv.off("focusin", focusInHandlerArray[i].handler);
                        focusInHandlerArray.splice(i, 1);

                        break;
                    }
                }
            }
            this._focusInHandlerArray[accId] = focusInHandlerArray;
        },

        /**
         * Enable or disable tab for the element.
         * @method enableTab
         * @param accId {String} of required element.
         * @param bEnable {Boolean} It tells whether tab for the element is to be enabled or disabled.
         **/
        "enableTab": function(accId, bEnable) {
            var elementModel = this._checkElementExistsByAccId(accId),
                tempSpan = null,
                tabIndex = -1;
            if (elementModel === false) {
                return null;
            }

            if (bEnable !== false) {
                tabIndex = elementModel.get("originalTabIndex") + this.model.startTab;
            }

            elementModel.set({
                "tabIndex": tabIndex,
                "tempTabIndex": tabIndex
            });



            this.model.elementViews[accId].setTabIndex();


            //DOM refresh after changing tabindex
            tempSpan = $("<span>").appendTo("body");
            tempSpan.remove();
        },

        /**
         * Updates the size of the focus rect if element resized
         * @method updateFocusRect
         * @param accId {String} of the element
         **/
        "updateFocusRect": function(accId) {

            var elementModel = this._checkElementExistsByAccId(accId);
            if (elementModel === false) {
                return null;
            }

            this.model.elementViews[accId].trigger("updateFocusRect");

        },
        /**
         * Event listener on pressing tab on last element in screen.
         * @event _onPressingTab
         * @param event {Object}
         **/
        "_onPressingTab": function(event) {

            var code = event.keyCode || event.which;

            if (code === 9 && event.shiftKey !== true) {
                event.preventDefault();
                this.setFocus(event.data.accIdOfFirstElement);
            }
        },
        /**
         * Makes the tab order for screen cycle properly.
         * @method updatePopupBounds
         * @param screenId {String} Id of required screen.
         * @param uniqueId {String} uniqueId of elements.
         **/
        "updatePopupBounds": function(screenId, uniqueid) {
            var elements = this.model.nodes.get(screenId).elements,
                accIdOfFirstElement = null,
                accId = null,
                idOfLastElement = null,
                tabindexOfElement = null,
                elementId,
                startTabIndex = 99999999999999999,
                endTabIndex = 0,
                data = null;
            /* tabIndex of each element is compared with startTabIndex and if it is small than startTabIndex then
            tabIndex of that element is stored in startTabIndex and accId of that element is stored in
            accIdOfFirstElement.*/
            _.each(elements.models, function(element) {
                accId = element.get("accId");
                elementId = element.get("id");
                if (uniqueid && accId !== null) {
                    accId = uniqueid + accId;
                    elementId = uniqueid + elementId;
                }
                tabindexOfElement = element.get("tabIndex");
                if (accId !== null) {
                    if (startTabIndex > tabindexOfElement) {
                        startTabIndex = tabindexOfElement;
                        accIdOfFirstElement = accId;

                    }
                    if (endTabIndex < tabindexOfElement) {
                        endTabIndex = tabindexOfElement;
                        idOfLastElement = elementId;

                    }
                }
            });

            data = {
                "accIdOfFirstElement": accIdOfFirstElement
            };
            if (idOfLastElement !== null) {
                this.model.elementViews[idOfLastElement].$el.off("keydown")
                    .on("keydown", data, $.proxy(this._onPressingTab, this));
            }

        },
        /**
         * Adds an input element before and after the player container for accessibility
         * @method initializeAccessibilityComponents
         * @param container {Object} Player container
         **/
        "initializeAccessibilityComponents": function(container) {
            this._setModelValues(container, false);

            var $firstFocusableElement = this._attachFirstElement(container),
                $lastFocusableElement = this._attachLastElement(container),
                $startWrapper = this._attachStartWrapper($firstFocusableElement),
                $startInputElement = this._attachStartInputElement($startWrapper),
                $endWrapper = this._attachEndWrapper($lastFocusableElement),
                $endInputElement = this._attachEndInputElement($endWrapper),
                interactiveElements = null,
                interactiveElementsLength = null,
                elementCounter = 0;

            this._attachAccessibilityEvents(container, $startInputElement, $endInputElement, $lastFocusableElement, $firstFocusableElement);

            // clear tabindex values of all element inside player
            interactiveElements = container.find("[tabindex]");
            interactiveElementsLength = interactiveElements.length;
            for (; elementCounter < interactiveElementsLength; elementCounter++) {
                $(interactiveElements[elementCounter]).attr("tabindex", -1);
            }

            this.model.set("accessibilityComponentsInitialized", true);
        },
        /**
         * Sets default values in the model
         * @method _setModelValues
         * @param $playerContainer {Object} Player container
         **/
        "_setModelValues": function($playerContainer, insideInteractivity) {
            // Saving tab index values of elements not created through manager
            if (!insideInteractivity) {
                this._saveNonAccTabIndex($playerContainer);
            }
            var elementsArray = $playerContainer.find("[tabindex]:visible:not(:disabled)"),
                tabIndexArray = [],
                validTabIndexArray = [],
                elementsArrayLength = elementsArray.length,
                elementCounter = 0,
                tabIndexVal = null,
                maxValueTabIndex = null,
                minValueTabIndex = null,
                firstElementTabIndex = null,
                lastElementTabIndex = null,
                firstElement = null,
                lastElement = null;

            for (; elementCounter < elementsArrayLength; elementCounter++) {
                tabIndexVal = Number($(elementsArray[elementCounter]).attr("tabindex"));
                tabIndexArray[elementCounter] = tabIndexVal;
                if (tabIndexVal > -1) {
                    validTabIndexArray.push(tabIndexVal);
                }
            }

            if (validTabIndexArray.length === 0) {
                firstElement = $playerContainer.next().find("input");
                lastElement = $playerContainer.prev().find("input");
            } else {
                minValueTabIndex = Math.min.apply(Math, validTabIndexArray);
                firstElementTabIndex = $.inArray(minValueTabIndex, tabIndexArray);
                firstElement = $(elementsArray[firstElementTabIndex]);

                maxValueTabIndex = Math.max.apply(Math, tabIndexArray);
                lastElementTabIndex = $.inArray(maxValueTabIndex, tabIndexArray);
                lastElement = $(elementsArray[lastElementTabIndex]);
            }

            //Unset previously stored value to prevent comparision of DOM elements
            this.model.set({
                "firstElement": null,
                "lastElement": null
            });

            this.model.set({
                "firstElement": firstElement,
                "lastElement": lastElement,
                "insideInteractivity": insideInteractivity
            });

        },
        /**
         * Saves the tab index of the element without acc divs
         * @method _saveNonAccTabIndex
         * @param $playerContainer {Object} Player container
         **/
        "_saveNonAccTabIndex": function _saveNonAccTabIndex($playerContainer) {
            var $elements = $playerContainer.find("[tabindex]").not("[temptabindex]"),
                elementsLength = $elements.length,
                counter = null,
                currentTabIndex = null;


            if ($elements.length > 0) {
                for (counter = 0; counter < elementsLength; counter++) {
                    currentTabIndex = $($elements[counter]).attr("tabindex");
                    $($elements[counter]).attr("savedtabindex", currentTabIndex);
                }
            }
        },

        /**
         * Attaches an element after the player container which acts as the last element
         * @method _attachLastElement
         * @param $playerContainer {Object} Player container
         **/
        "_attachLastElement": function($playerContainer) {
            var $lastElement = $("<div>", {
                    "class": "last-focusable-element"
                }).insertAfter($playerContainer)
                .css({
                    "height": 0,
                    "overflow": "hidden"
                });
            this.model.set("lastFocusableElement", $lastElement);
            return $lastElement;
        },

        /**
         * Attaches an element before the player container which acts as the first element
         * @method _attachFirstElement
         * @param $playerContainer {Object} Player container
         **/
        "_attachFirstElement": function($playerContainer) {
            var $firstElement = $("<div>", {
                    "class": "first-focusable-element"
                }).insertBefore($playerContainer)
                .css({
                    "height": 0,
                    "overflow": "hidden"
                });
            this.model.set("firstFocusableElement", $firstElement);
            return $firstElement;
        },
        /**
         * Attaches a wrapper before player container to hide input element
         * @method _attachStartWrapper
         * @param $playerContainer {Object} Player container
         **/
        "_attachStartWrapper": function($playerContainer) {

            //Add a wrapper div to hide starting input element
            var $startWrapper = $("<div>", {
                    "class": "checkbox-wrapper start-checkbox-wrapper"
                }).insertBefore($playerContainer)
                .css({
                    "height": 0,
                    "overflow": "hidden"
                });

            return $startWrapper;
        },
        /**
         * Attaches an input element before player container for accessibility
         * @method _attachStartInputElement
         * @param startWrapper {Object} Wrapper element used to hide the input element
         **/
        "_attachStartInputElement": function(startWrapper) {

            //Adding a start input element for DE accessibility
            var $startInputElement = $("<input type='checkbox' />")
                .attr("class", "start-checkbox")
                .attr("aria-hidden", true)
                .appendTo(startWrapper)
                .css({
                    "float": "left"
                });
            return $startInputElement;
        },
        /**
         * Attaches a wrapper after player container to hide input element
         * @method _attachEndWrapper
         * @param $playerContainer {Object} Player container
         **/
        "_attachEndWrapper": function($playerContainer) {

            //Add a wrapper div to hide ending input element
            var $endWrapper = $("<div>", {
                    "class": "checkbox-wrapper end-checkbox-wrapper"
                }).insertAfter($playerContainer)
                .css({
                    "height": 0,
                    "overflow": "hidden"
                });
            return $endWrapper;
        },
        /**
         * Attaches an input element after player container for accessibility
         * @method _attachEndInputElement
         * @param endWrapper {Object} Wrapper element used to hide the input element
         **/
        "_attachEndInputElement": function(endWrapper) {

            //Adding an end input element for DE accessibility
            var $endInputElement = $("<input type='checkbox' />")
                .attr("class", "end-checkbox")
                .attr("aria-hidden", true)
                .appendTo(endWrapper)
                .css({
                    "float": "left",
                    "position": "relative"
                });
            return $endInputElement;
        },

        "_setFocusableElementTabIndex": function() {
            var lastFocusableElement = this.model.get("lastFocusableElement"),
                firstFocusableElement = this.model.get("firstFocusableElement"),
                firstTabIndex = this.model.get("insideInteractivity") ? this.model.get("firstTabIndex") : -1,
                lastTabIndex = this.model.get("insideInteractivity") ? (this.model.get("tabIndexRange") + this.model.get("startTabindex")) : -1;

            firstFocusableElement.attr("tabindex", firstTabIndex);
            lastFocusableElement.attr("tabindex", lastTabIndex);
        },

        /**
         * Attaches events on input elements and player container
         * @method _attachAccessibilityEvents
         * @param $playerContainer {Object} Player container
         * @param $startInputElement {Object} Input element before player container
         * @param $endInputElement {Object} Input element after player container
         * @param $lastFocusableElement {Object} Element which acts as the last element
         **/
        "_attachAccessibilityEvents": function($playerContainer, $startInputElement, $endInputElement, $lastFocusableElement, $firstFocusableElement) {

            this._attachEventsOnStartElement($playerContainer, $startInputElement);
            this._attachEventsOnPlayerElements($lastFocusableElement, $firstFocusableElement);
            this._attachEventsOnEndElement($playerContainer, $endInputElement);
        },
        /**
         * Attaches focus in event on start input element
         * @method _attachEventsOnStartElement
         * @param $playerContainer {Object} Player container
         * @param $startWrapper {Object} Wrapper element used to hide the input element before player container
         * @param $startInputElement {Object} Input element before player container
         **/
        "_attachEventsOnStartElement": function($playerContainer, $startInputElement) {

            var self = this;

            //Attach focusin event on starting input element to handle accessibility through DE's elements
            $startInputElement.on("focusin.setResetTabIndex", function(event) {
                var elements = null,
                    index = null,
                    tabbables = null,
                    tabIndexVal = null,
                    elementsLength = null,
                    elementCounter = 0,
                    $currentElement = null;

                if (!self.model.get("insideInteractivity")) {
                    elements = $playerContainer.find("[tabindex]");

                    elementsLength = elements.length;

                    for (; elementCounter < elementsLength; elementCounter++) {
                        $currentElement = $(elements[elementCounter]);
                        tabIndexVal = $currentElement.attr("temptabindex") || $currentElement.attr("savedtabindex");
                        $currentElement.attr("tabindex", tabIndexVal);
                    }
                    self._setModelValues($playerContainer, true);
                    self.model.set("insideInteractivity", true);
                    self._setFocusableElementTabIndex();

                    setTimeout(function() {
                        self.model.get("firstElement").focus();
                    }, 100);
                } else {
                    self._setModelValues($playerContainer, false);
                    elements = $playerContainer.find("[tabindex]");
                    elementsLength = elements.length;

                    for (; elementCounter < elementsLength; elementCounter++) {
                        $(elements[elementCounter]).attr("tabindex", -1);
                    }
                    tabbables = $(":tabbable:visible:not(:disabled)");
                    index = $.inArray(this, tabbables);

                    self._setFocusableElementTabIndex();
                    setTimeout(function() {
                        //Checks if a tabbable element is present before it and shifts focus to it if true, else shifts focus to last tabbable element on page
                        if (tabbables[index - 1]) {
                            tabbables[index - 1].focus();
                        } else {
                            tabbables[tabbables.length - 1].focus();
                        }
                    }, 100);
                }
            });
        },
        /**
         * Attaches keydown events on all player elements
         * @method _attachEventsOnPlayerElements
         * @param $playerContainer {Object} Player container
         * @param $lastFocusableElement {Object} Element to be used as the last element
         **/
        "_attachEventsOnPlayerElements": function($lastFocusableElement, $firstFocusableElement) {
            var self = this;

            $lastFocusableElement.on("focusin.setResetTabIndex", function(event) {
                if (self.model.get("insideInteractivity")) {
                    $lastFocusableElement.next().find("input").focus();
                }
            });

            $firstFocusableElement.on("focusin.setResetTabIndex", function(event) {
                if (self.model.get("insideInteractivity")) {
                    $firstFocusableElement.prev().find("input").focus();
                }
            });
        },

        /**
         * Attaches focus in event on end input element
         * @method _attachEventsOnEndElement
         * @param $playerContainer {Object} Player container
         * @param $endWrapper {Object} Wrapper element used to hide the input element after player container
         * @param $endInputElement {Object} Input element after player container
         **/
        "_attachEventsOnEndElement": function($playerContainer, $endInputElement) {
            var self = this;
            $endInputElement.on("focusin.setResetTabIndex", function(event) {

                var elements = null,
                    tabbables = null,
                    index = null,
                    elementsLength = null,
                    elementCounter = 0,
                    $currentElement = null;

                if (self.model.get("insideInteractivity")) {
                    self._setModelValues($playerContainer, false);

                    elements = $playerContainer.find("[tabindex]");
                    elementsLength = elements.length;

                    for (; elementCounter < elementsLength; elementCounter++) {
                        $(elements[elementCounter]).attr("tabindex", -1);
                    }

                    tabbables = $(":tabbable:visible:not(:disabled)");
                    index = $.inArray(this, tabbables);

                    self._setFocusableElementTabIndex();

                    setTimeout(function() {
                        //Checks if a tabbable element is present after it and shifts focus to it if true, else shifts focus to first tabbable element on page
                        if (tabbables[index + 1]) {
                            tabbables[index + 1].focus();
                        } else {
                            tabbables[0].focus();
                        }
                    }, 100);
                } else {

                    elements = $playerContainer.find("[tabindex]");

                    elementsLength = elements.length;
                    for (; elementCounter < elementsLength; elementCounter++) {
                        $currentElement = $(elements[elementCounter]);
                        $currentElement.attr("tabindex", $currentElement.attr("temptabindex") || $currentElement.attr("savedtabindex"));
                    }
                    self._setModelValues($playerContainer, true);
                    self.model.set("insideInteractivity", true);
                    self._setFocusableElementTabIndex();
                    setTimeout(function() {
                        self.model.get("lastElement").focus();
                    }, 100);
                }
            });
        }
    });
}(window.MathUtilities));
