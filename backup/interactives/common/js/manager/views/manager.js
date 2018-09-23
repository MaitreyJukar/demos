(function (MathUtilities) {
    'use strict';

    /*Chcek for MathUtilities and MathUtilities.Components */
    if (typeof MathUtilities === 'undefined') {
        MathUtilities = window.MathUtilities = {};
    }

    if (typeof MathUtilities.Components === 'undefined') {
        MathUtilities.Components = {}
    }

    var manager = MathUtilities.Components.Manager;

    if (MathUtilities.Components && manager && manager.Models && manager.Views && manager.Collections && manager.Views.Manager) {
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
        el: 'body',
        initialize: function () {
            if (('ontouchstart' in window)) {
                this.model.isAccessible = false;
                this.model.set('isAccessible', false);
            }
        },


        renderElements: function (screenId, uniqueId) {
            var self = this,
                elements = this.model.nodes.get(screenId).elements,
                screen = this.model.screens[screenId] = {},
                elementViews = this.model.elementViews || {},
                elementId = null,
                accId = null,
                elementNode = null, accMessage,
                messages = null, i, newElementId = null,
                tabIndex = null, dummyElement = null,
                elementView = null,
                newAccId = null,
                accElementNode = null;
            elements.each(function (element) {
                accId = element.get('accId');
                messages = element.messages.models;
                accMessage = element.message.acc;
                elementId = element.get('id');
                newElementId = elementId;
                newAccId = accId;
                tabIndex = element.get('tabIndex');
                if (((tabIndex !== null && tabIndex !== undefined) || (accMessage !== null && accMessage !== undefined)) && (accId === null || accId === undefined)) {

                    accId = elementId;
                    element.set('accId', accId);
                    self.model.elementsByAccId[accId] = element;

                }
                element.manager.isAccessible = self.model.isAccessible;
                elementNode = self.$el.find('#' + elementId);
                accElementNode = (elementId === accId) ? elementNode : self.$el.find('#' + accId);
                dummyElement = element;
                if (uniqueId !== null && uniqueId !== undefined) {
                    dummyElement = element.clone(); dummyElement.manager = self.model;
                    dummyElement.manager.isAccessible = self.model.isAccessible;
                    dummyElement.set('id', uniqueId + element.get('id'));
                    dummyElement.id = dummyElement.get('id')
                    if (accId !== null && accId !== undefined) {
                        dummyElement.set('accId', uniqueId + accId);
                        newAccId = uniqueId + accId;
                    }
                    newElementId = dummyElement.get('id');
                    elementNode = '#' + newElementId;
                    accElementNode = (elementId === accId) ? elementNode : '#' + dummyElement.get('accId');
                    self.model.elementsById[newElementId] = dummyElement;
                    self.model.elementsByAccId[dummyElement.get('accId')] = dummyElement;
                }
                elementView = new MathUtilities.Components.Manager.Views.ElementView({
                    el: elementNode,
                    model: dummyElement,
                    accEl: accElementNode
                });
                elementViews[newElementId] = elementView;
                screen[newElementId] = elementView;
                if (newAccId !== null) {
                    elementViews[newAccId] = elementView;
                }
                elementView.render();
            });

        },
        /**
        * creates accessible div for specified element.
        * @method createAccDiv
        * @param obj {Object} Element Id of required element.
        **/
        createAccDiv: function (obj) {
            var elementId = obj.elementId,
                i = 0,
                type = obj.type ? obj.type : 'text',
                uniqueId = obj.uniqueId,
                tabIndex = obj.tabIndex,
                templateJson = {
                    'id': elementId,
                    'type': type,
                    'accId': elementId,
                    'role': obj.role,
                    'selector': obj.selector,
                    'isMathquill': obj.isMathquill,
                    'offsetTop': obj.offsetTop,
                    'offsetLeft': obj.offsetLeft,
                    'tabIndex': tabIndex,
                    'originalTabIndex': tabIndex,
                    'isWrapOn': obj.isWrapOn,
                    'messages': [{
                        'message': {
                            'loc': obj.loc,
                            'acc': obj.acc
                        }
                    }]
                }, elementView, elements, accScreen;
            if (elementId === null || elementId === undefined) {
                return;
            }
            accScreen = this.model.get('accScreen');
            if (uniqueId !== null && uniqueId !== undefined) {
                elementId = uniqueId + elementId;
                templateJson.accId = uniqueId + templateJson.accId;
                templateJson.id = elementId;
            }
            if (tabIndex !== null && tabIndex !== undefined) {
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
                el: '#' + elementId,
                model: this.model.elementsByAccId[elementId],
                accEl: '#' + elementId
            });
            this.model.elementViews[elementId] = elementView;
            elementView.render();
        },
        /**
        * sets size of acc div equal to elements size.
        * @method restrictAccDivSize
        * @param accId
        **/
        restrictAccDivSize: function (accId) {
            var elementModel = this._checkElementExistsByAccId(accId),
                $element, width, height;
            if (elementModel === null) {
                return null;
            }
            $element = $('#' + accId);
            height = $element.innerHeight();
            width = $element.innerWidth();
            $element.find('#' + accId + '-acc-elem').css({
                width: width,
                height: height,
                top: '0px',
                left: '0px'
            });
        },
        /**
        * sets acc and loc message for element.
        * @method setLocAccMessage
        * @param id {String} Element Id of required element.
        * @param messageArray {Array} Message array.
        **/
        setLocAccMessage: function (id, messageArray) {
            if (messageArray === undefined) {
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
        _checkElementExists: function (elementId) {
            var elementModel = this.model.elementsById[elementId];

            if (elementModel === undefined) {
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
        _checkMessageExists: function (elementModel, messageId) {
            var messageNode = elementModel.messages.get(messageId);
            if (messageNode === undefined) {
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
        _validateElementMessage: function (elementId, messageId) {
            var elementModel = this._checkElementExists(elementId),
                messageNode = null;
            if (elementModel === false) {
                return false;
            }
            messageNode = this._checkMessageExists(elementModel, messageId);
            if (messageNode === false) {
                return false;
            }
            return {
                elementModel: elementModel,
                messageNode: messageNode
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
        getMessage: function (elementId, messageId, arrParam) {
            var elementModel = null,
                messageNode = null,
                result = null,
                emptyText = '';

            result = this._validateElementMessage(elementId, messageId);

            if (result === false) {
                return null;
            }

            if (this.model.getNoTextMode()) {
                return emptyText;
            }

            elementModel = result.elementModel;
            messageNode = result.messageNode;
            var locMessage = messageNode.message.loc;
            if (arrParam !== null && arrParam !== undefined) {
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
        _replaceSpecialStr: function (message, arrParam) {
            for (var i = 0; i < arrParam.length; i++) {


                message = message.replace('%@$%', arrParam[i]);

            }
            return message;
        },
        /**
        * Changes the loc message for element.
        * @method changeMessage
        * @param elementId {String} Element id of required element.
        * @param messageId {String} Message id of the required message
        **/
        changeMessage: function (elementId, messageId, arrParam) {
            var elementModel = null,
                result = null, originalMessage, modifiedLocMessage,
                currentMessage = null;
            result = this._validateElementMessage(elementId, messageId);
            if (result === false) {
                return null;
            }
            elementModel = result.elementModel;
            currentMessage = $.extend({}, elementModel.get('message'));
            currentMessage.loc = result.messageNode.message.loc;
            modifiedLocMessage = currentMessage.loc;
            if (arrParam !== null && arrParam !== undefined) {
                modifiedLocMessage = this._replaceSpecialStr(currentMessage.loc, arrParam);
            }
            currentMessage.loc = modifiedLocMessage;
            elementModel.set('message', currentMessage);
            this.model.elementViews[elementId]._setMessage();
        },

        /**
        * Sets the selector for element.
        * @method changeSelector
        * @param accId {String} Element id of required element.
        * @param selector {String} Selector onto which focus is to be set.
        **/
        setSelector: function (accId, selector) {
            var elementModel = this._checkElementExistsByAccId(accId);
            if (elementModel === false) {
                return null;
            }
            if (selector && selector !== '') {
                elementModel.set('selector', selector);
            }
            this._updateAccScreenSelector(accId, selector);
        },

        /**
        * Returns the selector for element.
        * @method getSelector
        * @param accId {String} Element id of required element.
        **/
        getSelector: function (accId) {
            var elementModel = this._checkElementExistsByAccId(accId),
                selector = elementModel.get('selector');
            if (elementModel === false || selector) {
                return null;
            }
            return selector;
        },

        /**
        * Sets the type for element.
        * @method setType
        * @param accId {String} Element id of required element.
        * @param type {String} type of required element.
        **/
        setType: function (accId, type) {
            var elementModel = this._checkElementExistsByAccId(accId);
            if (elementModel === false) {
                return null;
            }
            if (type && type !== '') {
                elementModel.set('type', type);
            }
            this._updateAccScreenType(accId, type);
        },

        /**
        * Returns the type for element.
        * @method getType
        * @param accId {String} Element id of required element.
        **/
        getType: function (accId) {
            var elementModel = this._checkElementExistsByAccId(accId),
                type = elementModel.get('type');
            if (elementModel === false || type) {
                return null;
            }
            return type;
        },

        /**
        * Sets whether required element is mathquill.
        * @method setIsMathquill
        * @param accId {String} Element id of required element.
        * @param isMathquill {String} if required element is mathquill.
        **/
        setIsMathquill: function (accId, isMathquill) {
            var elementModel = this._checkElementExistsByAccId(accId);
            if (elementModel === false) {
                return null;
            }
            if (typeof (isMathquill) !== 'undefined' || isMathquill !== null || isMathquill !== '') {
                elementModel.set('isMathquill', isMathquill);
            }
            this._updateAccScreenIsMathquill(accId, isMathquill);
        },

        /**
        * Returns the type for element.
        * @method getType
        * @param accId {String} Element id of required element.
        **/
        getIsMathquill: function (accId) {
            var elementModel = this._checkElementExistsByAccId(accId),
                isMathquill = elementModel.get('isMathquill');
            if (elementModel === false || isMathquill === null || typeof (isMathquill) === 'undefined') {
                return null;
            }
            return isMathquill;
        },

        /**
        * Sets the loc message for element.
        * @method setMessage
        * @param elementId {String} Element id of required element.
        * @param message {String} Localized message string
        **/
        setMessage: function (elementId, message, arrParam) {
            var elementModel, messageNode, result;


            result = this._checkElementExists(elementId);

            if (result === false) {
                return null;
            }

            elementModel = result;
            messageNode = elementModel.message;
            var locMessage = message;
            if (arrParam !== null && arrParam !== undefined) {
                locMessage = this._replaceSpecialStr(locMessage, arrParam);
            }
            messageNode.loc = locMessage;
            elementModel.set('message', messageNode);
            this.model.elementViews[elementId]._setMessage();

            this._updateAccScreenMessageData(elementId, messageNode);

        },

        /*
         * Update Acc Screen elements message nodes
         * @method _updateAccScreenMessageData
         * @param {String} elementId
         * @param {object} messageNode
         * @private
         */
        _updateAccScreenMessageData: function _updateAccScreenMessageData(elementId, messageNode) {
            var accScreenElements = this.model.get('accScreen')[0].elements,
                elementIndex,
                currentElement = null;

            for (elementIndex in accScreenElements) {
                currentElement = accScreenElements[elementIndex];
                if (currentElement.hasOwnProperty(elementId)) {
                    currentElement.messages[0].message = messageNode;
                    return;
                }
            }
            return false;
        },

        /*
         * Update Acc Screen elements type
         * @method _updateAccScreenType
         * @param {String} elementId
         * @param {String} type
         * @private
         */
        _updateAccScreenType: function _updateAccScreenMessageData(elementId, type) {
            var accScreenElements = this.model.get('accScreen')[0].elements,
                elementIndex,
                currentElement = null;

            for (elementIndex in accScreenElements) {
                currentElement = accScreenElements[elementIndex];
                if (currentElement.hasOwnProperty(elementId)) {
                    currentElement.type = type;
                    return;
                }
            }
            return false;
        },

        /*
         * Update Acc Screen elements selector
         * @method _updateAccScreenSelector
         * @param {String} elementId
         * @param {String} selector
         * @private
         */
        _updateAccScreenSelector: function _updateAccScreenMessageData(elementId, selector) {
            var accScreenElements = this.model.get('accScreen')[0].elements,
                elementIndex,
                currentElement = null;

            for (elementIndex in accScreenElements) {
                currentElement = accScreenElements[elementIndex];
                if (currentElement.hasOwnProperty(elementId)) {
                    currentElement.selector = selector;
                    return;
                }
            }
            return false;
        },

        /*
         * Update Acc Screen elements isMathquill
         * @method _updateAccScreenIsMathquill
         * @param {String} elementId
         * @param {Boolean} isMathquill
         * @private
         */
        _updateAccScreenIsMathquill: function _updateAccScreenMessageData(elementId, isMathquill) {
            var accScreenElements = this.model.get('accScreen')[0].elements,
                elementIndex,
                currentElement = null;

            for (elementIndex in accScreenElements) {
                currentElement = accScreenElements[elementIndex];
                if (currentElement.hasOwnProperty(elementId)) {
                    currentElement.isMathquill = isMathquill;
                    return;
                }
            }
            return false;
        },
        /*
         * Update tabindex Acc Screen elements.
         * @method _updateAccScreenTabIndex
         * @param {String} elementId
         * @param {Number} tabIndex
         * @private
         */
        _updateAccScreenTabIndex: function (elementId, tabIndex) {
            var accScreenElements = this.model.get('accScreen')[0].elements,
                elementIndex,
                currentElement = null;

            for (elementIndex in accScreenElements) {
                currentElement = accScreenElements[elementIndex];
                if (currentElement.hasOwnProperty(elementId)) {
                    currentElement.tabIndex = tabIndex;
                    return;
                }
            }
            return false;
        },

        /**
        * Loads the required screen.
        * @method loadScreen
        * @param screenId {String} Id of required screen.
        **/
        loadScreen: function (screenId, uniqueId) {
            this.renderElements(screenId, uniqueId);
        },

        /**
        * Unload the screen.
        * @method unloadScreen.
        * @param screenId {String} Id of required screen.
        * @param uniqueId {String} UniqueId of required screen.
        **/
        unloadScreen: function (screenId, uniqueId) {
            var elements = this.model.nodes.get(screenId).elements,
                self = this,
                accId = null,
                elementId = null;
            elements.each(function (element) {
                elementId = element.get('id');
                accId = element.get('accId');
                element.set('tabIndex', element.get('originalTabIndex'));
                if (uniqueId !== null && uniqueId !== undefined) {
                    elementId = uniqueId + element.get('id');
                    if (accId !== null && accId !== undefined) {
                        accId = uniqueId + element.get('accId');
                    }
                }
                if (typeof self.model.elementViews[elementId] !== 'undefined') {
                    self.model.elementViews[elementId].unload();
                    delete self.model.elementViews[elementId];
                    delete self.model.elementViews[accId];
                }

            });
            //destroyElements(screenId);
        },
        /**
        * Checks if the element exists in the managers' elements collection.
        * @method _checkElementExistsByAccId
        * @private
        * @param accId {String} Id of the required element
        * @return {Boolean | Object} Returns false if element is not found.
        *         Returns element's model if element is found.
        **/
        _checkElementExistsByAccId: function (accId) {
            var elementModel = this.model.elementsByAccId[accId];
            if (elementModel === undefined) {
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
        getTabIndex: function (strAccId) {
            var elementModel = this._checkElementExistsByAccId(strAccId);
            if (elementModel === false) {
                return null;
            }
            return elementModel.get('originalTabIndex');
        },
        /**
        * Sets the tabIndex for element.
        * @method setTabIndex
        * @param elementId {Object} Element accId of required element.
        * @param newTabIndex {Number} new value of tabIndex
        **/
        setTabIndex: function (strAccId, newTabIndex) {
            var elementModel = this._checkElementExistsByAccId(strAccId);
            if (elementModel) {
                elementModel.set('tabIndex', this.model.startTab + newTabIndex);
                elementModel.set('originalTabIndex', newTabIndex);
            }
            else {
                return null;
            }
            this.model.elementViews[strAccId]._setTabIndex();
            this._updateAccScreenTabIndex(strAccId, newTabIndex);
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
        _validateElementMessageByAccId: function (accId, messageId) {
            var elementModel = this._checkElementExistsByAccId(accId),
                messageNode = null;
            if (elementModel === false) {
                return false;
            }
            messageNode = this._checkMessageExists(elementModel, messageId);
            if (messageNode === false) {
                return false;
            }
            return {
                elementModel: elementModel,
                messageNode: messageNode
            };
        },
        /**
        * Changes the acc message for element.
        * @method changeAccMessage
        * @param accId {String} of required element.
        * @param messageId {String} of the required message
        **/
        changeAccMessage: function (accId, messageId, arrParam) {
            if (this.model.isAccessible === false) {
                return;
            }
            var elementModel = null,
                result = null, modifiedAccMessage, originalMessage,
                currentMessage = null;

            result = this._validateElementMessageByAccId(accId, messageId);
            if (result === false) {
                return null;
            }
            elementModel = result.elementModel;
            currentMessage = $.extend({}, elementModel.get('message'));
            currentMessage.acc = result.messageNode.message.acc
            modifiedAccMessage = currentMessage.acc;
            if (arrParam !== null && arrParam !== undefined) {
                modifiedAccMessage = this._replaceSpecialStr(currentMessage.acc, arrParam);
            }
            currentMessage.acc = modifiedAccMessage;
            elementModel.set('message', currentMessage);
            this.model.elementViews[accId]._setMessage();
        },
        /**
        * Sets the acc message for element.
        * @method setAccMessage
        * @param accId {String} of required element.
        * @param message {String} accessible message string
        **/
        setAccMessage: function (accId, message, arrParam) {
            var elementModel, messageNode, result;

            result = this._checkElementExistsByAccId(accId);
            if (result === false) {
                return null;
            }
            elementModel = result;
            messageNode = elementModel.message;
            var accMessage = message;
            if (arrParam !== null && arrParam !== undefined) {
                accMessage = this._replaceSpecialStr(accMessage, arrParam);
            }
            messageNode.acc = accMessage;
            elementModel.set('message', messageNode);
            this.model.elementViews[accId]._setMessage();

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
        getAccMessage: function (accId, messageId, arrParam) {

            var elementModel = null,
                messageNode = null,
                result = null,
                emptyText = '';

            result = this._validateElementMessageByAccId(accId, messageId);

            if (result === false) {
                return null;
            }

            if (this.model.getNoTextMode()) {
                return emptyText;
            }

            messageNode = result.messageNode;
            var accMessage = messageNode.message.acc;
            if (arrParam !== null && arrParam !== undefined) {
                accMessage = this._replaceSpecialStr(accMessage, arrParam);
            }
            return accMessage;
        },
        /**
        * Sets the acc message for element.
        * @method setFocus 
        * @param accId {String} of required element.
        **/
        setFocus: function (accId, delay) {
            // no accessibility for touch devices.
            var supportsTouch = ('ontouchstart' in window);
            if (supportsTouch) {
                return null;
            }
            var elementModel = this._checkElementExistsByAccId(accId),
                elementId = null,
                elementView = this.model.elementViews;
            if (elementModel === false) {
                return null;
            }
            elementId = elementModel.id;
            if (delay === null || delay === undefined) {
                //elementModel.set('isFocussed', true);
                elementView[elementId]._setFocus();
            }
            else {
                setTimeout(function () { elementView[elementId]._setFocus(); }, delay);
            }
        },
        //        setFocusById: function(elementId,delay) {
        //            var elementModel=this._checkElementExists(elementId);
        //            if (elementModel === false) {
        //                return null;
        //            }
        //            
        //            if(delay===null) {
        //                elementModel.set('isFocussed',true);
        //            }
        //            else {
        //                setTimeout(function(){elementModel.set('isFocussed',true);},delay);
        //            }
        //        },
        _focusOutHandlerArray: {},
        /** 
        * Adds the listener for focusout event.
        * @method focusOut
        * @param accId {String} of required element.
        * @param focusOutHandler {Function} Listener which is to be added for focusout event.
        * @param delay {Number} Time delay after which added listener is executed.
        * @param addOrRemove {Boolean} It tells whether given listener is to be added or removed.
        **/
        focusOut: function (accId, focusOutHandler, delay, addOrRemove) {
            var elementModel = this._checkElementExistsByAccId(accId),
                focusOutHandlerArray = this._focusOutHandlerArray[accId];
            if (elementModel === false) {
                return null;
            }
            if (delay === null || delay === undefined) {
                delay = 0;
            }

            function handler() {
                var self = this;
                setTimeout(function () {
                    var func = $.proxy(focusOutHandler, self);
                    func();
                }, delay);
            }
            var $hackDiv = $('#' + accId + '-acc-elem');
            if (addOrRemove === true || addOrRemove === null || addOrRemove === undefined) {
                $hackDiv.on('focusout', $.proxy(handler, $hackDiv));
                var data = { focusOutHandler: focusOutHandler, handler: handler };
                if (focusOutHandlerArray === null || focusOutHandlerArray === undefined) {
                    focusOutHandlerArray = [];
                }
                var handlerLength = focusOutHandlerArray.length;
                focusOutHandlerArray[handlerLength] = data;
            }
            if (addOrRemove === false) {
                var handlerLength = focusOutHandlerArray ? focusOutHandlerArray.length : 0;
                for (var i = 0; i < handlerLength; i++) {
                    if (focusOutHandlerArray[i].focusOutHandler === focusOutHandler) {
                        $hackDiv.off('focusout', focusOutHandlerArray[i].handler);
                        focusOutHandlerArray.splice(i, 1);
                        break;
                    }
                }
            }
            this._focusOutHandlerArray[accId] = focusOutHandlerArray;
        },

        _focusInHandlerArray: {},
        /** 
        * Adds the listener for focusin event.
        * @method focusIn
        * @param accId {String} of required element.
        * @param focusInHandler {Function} Listener which is to be added for focusin event.
        * @param delay {Number} Time delay after which added listener is executed.
        * @param addOrRemove {Boolean} It tells whether given listener is to be added or removed.
        **/
        focusIn: function (accId, focusInHandler, delay, addOrRemove) {
            var elementModel = this._checkElementExists(accId),
                focusInHandlerArray = this._focusInHandlerArray[accId];
            if (elementModel === false) {
                return null;
            }
            var $hackDiv = $('#' + accId + '-acc-elem');
            if (delay === null || delay === undefined) {
                delay = 0;
            }

            function handler() {
                var self = this;
                setTimeout(function () {
                    var func = $.proxy(focusInHandler, self);
                    func();
                }, delay);
            }
            if (addOrRemove === true || addOrRemove === null || addOrRemove === undefined) {
                $hackDiv.on('focusin', $.proxy(handler, $hackDiv));
                var data = { focusInHandler: focusInHandler, handler: handler };
                if (focusInHandlerArray === null || focusInHandlerArray === undefined) {
                    focusInHandlerArray = [];

                }
                var handlerLength = focusInHandlerArray.length;
                focusInHandlerArray[handlerLength] = data;

            }
            if (addOrRemove === false) {
                var handlerLength = focusInHandlerArray ? focusInHandlerArray.length : 0;
                for (var i = 0; i < handlerLength; i++) {

                    if (focusInHandlerArray[i].focusInHandler === focusInHandler) {
                        $hackDiv.off('focusin', focusInHandlerArray[i].handler);
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
        enableTab: function (accId, bEnable) {
            var elementModel = this._checkElementExistsByAccId(accId),
                tempSpan = null;
            if (elementModel === false) {
                return null;
            }
            if (bEnable === false) {
                elementModel.set('tabIndex', -1);
            }
            else {
                elementModel.set('tabIndex', elementModel.get('originalTabIndex') + this.model.startTab);
            }
            this.model.elementViews[accId]._setTabIndex();


            //DOM refresh after changing tabindex 
            tempSpan = $('<span>').appendTo('body');
            tempSpan.remove();
        },
        /**
        * Checks if any duplicate element exists in the array
        * @param arr Array 
        * @private
        * @return {Boolean} Returns true if any element is repeated
        *         Returns false if does not found any duplicates
        **/
        _checkDuplicateInArray: function (arr) {
            var len = arr.length;
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < len; j++) {
                    if (i === j) {
                        j++;
                    }
                    if (arr[i] === arr[j]) {
                        repeat === true;
                        return true;
                    }
                }

            }
            return false;
        },
        /**
        * Verifies each element model if it has all elementIds, accIds, tabIndexes Unique
        * If found any duplicates logged as error in console.
        **/
        verify: function () {
            //To Do
            return;
            var elements = this.model.elementsById;
            var ids = [];
            var accIds = [];
            var tabIndexes = [];

            for (obj in elements) {

                ids.push(elements[obj].id);
                accIds.push(elements[obj].accId);
                tabIndexes.push(elements[obj].tabIndex);
            }
            if (this._checkDuplicateInArray(ids)) {

            }
            if (this._checkDuplicateInArray(accIds)) {

            }
            if (this._checkDuplicateInArray(tabIndexes)) {

            }
        },
        /**
        * Updates the size of the focus rect if element resized
        * @method updateFocusRect
        * @param accId {String} of the element
        **/
        updateFocusRect: function (accId) {

            var elementModel = this._checkElementExistsByAccId(accId);
            if (elementModel === false) {
                return null;
            }
            //this.listenTo(elementModel, 'change', this.abc);
            this.model.elementViews[accId].trigger('updateFocusRect');
            //MathUtilities.Components.Manager.Views.ElementView._updateFocusRect()
        },
        /**
        * Event listener on pressing tab on last element in screen.
        * @event _onPressingTab
        * @param event {Object}
        **/
        _onPressingTab: function (event) {

            var code = event.keyCode || event.which;

            if (code === 9 && event.shiftKey !== true) {
                event.preventDefault();
                //console.log('hi');
                //console.log(accIdOfFirstElement)
                this.setFocus(event.data.accIdOfFirstElement);
            }
        },
        /**
        * Makes the tab order for screen cycle properly. 
        * @method updatePopupBounds
        * @param screenId {String} Id of required screen.
        * @param uniqueId {String} uniqueId of elements.
        **/
        updatePopupBounds: function (screenId, uniqueid) {
            var elements = this.model.nodes.get(screenId).elements,
                accIdOfFirstElement = null,
                accIdOfLastElement = null,
                self = this,
                accId = null,
                idOfLastElement = null,
                tabindexOfElement = null, elementId,
                startTabIndex = 99999999999999999,
                endTabIndex = 0;
            /* tabIndex of each element is compared with startTabIndex and if it is small than startTabIndex then
            tabIndex of that element is stored in startTabIndex and accId of that element is stored in 
            accIdOfFirstElement.*/
            elements.each(function (element) {
                accId = element.get('accId');
                elementId = element.get('id')
                if (uniqueid !== null && uniqueid !== undefined && accId !== null && accId !== undefined) {
                    accId = uniqueid + accId;
                    elementId = uniqueid + elementId;
                }
                tabindexOfElement = element.get('tabIndex');
                if (accId !== null && accId !== undefined) {
                    if (startTabIndex > tabindexOfElement) {
                        startTabIndex = tabindexOfElement;
                        accIdOfFirstElement = accId;

                    }
                    if (endTabIndex < tabindexOfElement) {
                        endTabIndex = tabindexOfElement;
                        accIdOfLastElement = accId;
                        idOfLastElement = elementId;

                    }
                }
            });
            //self.setFocus(accIdOfFirstElement);
            var data = { accIdOfFirstElement: accIdOfFirstElement };
            if (idOfLastElement !== null) {
                self.model.elementViews[idOfLastElement].$el.off('keydown').on('keydown', data, $.proxy(self._onPressingTab, this));
            }

        }
    });
}(window.MathUtilities));
