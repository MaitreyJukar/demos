/* globals window */

(function(MathUtilities) {
    "use strict";
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
        "defaults": function() {
            return {
                "id": null,
                "accId": null,
                "type": "text",
                "messages": null,
                "tabIndex": null,
                "isAccTextSame": false,
                "isFocussed": false,
                "originalTabIndex": null,
                "role": null,
                "height": null,
                "width": null,
                "offsetTop": 2,
                "isWrapOn": null,
                "offsetLeft": 2,
                "isMathquill": false,
                "selector": null,
                "tempTabIndex": null
            };
        },

        "manager": null,

        /**
         * Initializes the messages collection. Also binds a listener, that listens to any change in
         * the current message object.
         * @method initialize
         **/

        "initialize": function() {

            var messageNode = null,
                messagesData = this.get("messages");

            if (this.get("tabIndex") === null) {
                this.set("tabIndex", this.get("originalTabIndex"));
            }
            if (this.get("originalTabIndex") === null) {
                this.set("originalTabIndex", this.get("tabIndex"));
            }


            this.messages = new MathUtilities.Components.Manager.Collections.Messages();
            this.messages.isAccTextSame = this.get("isAccTextSame");
            this.messages.add(messagesData);
            this.originalTabIndex = this.get("originalTabIndex");
            if (this.messages.length) {
                messageNode = this.messages.first().message;
                this.message = new MathUtilities.Components.Manager.Models.TextNode(messageNode);
                this.set("message", this.message.toJSON());
            }
        }
    });
}(window.MathUtilities));
