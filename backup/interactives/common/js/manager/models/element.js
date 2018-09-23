(function (MathUtilities) {
    'use strict';
    if (MathUtilities.Components.Manager.Models.Element) {
        return;
    }
    /**
     * Model for a node element. It holds data about the element and also manages a collection of messages
     * associated with the current element.
     * @module Models
     * @class Element
     * @extends Backbone.model
     * @constructor
     **/
    MathUtilities.Components.Manager.Models.Element = Backbone.Model.extend({
        /**
         * Initialize default parameters to null. Default type of element is set to 'text', and isAccTextSame is 0.
         * @method defaults
         * @return {Object} Returns default parameters.
         **/
        defaults: function () {
            return {
                id: null,
                accId: null,
                type: 'text',
                messages: null,
                tabIndex: null,
                isAccTextSame: false,
                isFocussed: false,
                originalTabIndex: null,
                role: null,
                height: null,
                width: null,
                offsetTop: 2,
                isWrapOn: null,
                offsetLeft: 2,
                isMathquill: false,
                selector: null
            };
        },

        manager: null,

        /**
         * Initializes the messages collection. Also binds a listener, that listens to any change in
         * the current message object.
         * @method initialize
         **/
        initialize: function () {

            var self = this,
                messageNode = null,
                messagesData = self.get('messages'),
                accId = null;
            //self.set('originalTabIndex', self.get('tabIndex'));
            //console.log(self.id);

            if (self.get('tabIndex') === null) {
                self.set('tabIndex', self.get('originalTabIndex'));
            }
            if (self.get('originalTabIndex') === null) {
                self.set('originalTabIndex', self.get('tabIndex'));
            }


            self.messages = new MathUtilities.Components.Manager.Collections.Messages();
            self.messages.isAccTextSame = self.get('isAccTextSame');
            self.messages.add(messagesData);
            self.originalTabIndex = self.get('originalTabIndex');
            if (self.messages.length !== 0) {
                messageNode = self.messages.first().message;
                accId = self.get('accId') || self.id;

                self.message = new MathUtilities.Components.Manager.Models.TextNode(messageNode);
                self.set('message', self.message.toJSON());
            }
        },
        getIsWrapOn: function () {
            return this.get('isWrapOn');
        },
        setIsWrapOn: function (isWrapOn) {
            this.set('isWrapOn', isWrapOn);
        }
    });
}(window.MathUtilities));
