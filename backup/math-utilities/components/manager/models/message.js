/* globals window */

/*jslint todo: true */
(function(MathUtilities) {
    "use strict";
    if (MathUtilities.Components.Manager.Models.Message) {
        return;
    }
    /**
     * Model for the Elements message. This model stores the reference to the text message model, as well as few message
     * specific properties.
     * Default properties are id, message model, isAccTextSame which are initialized as null.
     * @module Models
     * @class Message
     * @constructor
     * @extends Backbone.model
     * @namespace MathUtilities.Components.Manager.Models
     **/
    MathUtilities.Components.Manager.Models.Message = Backbone.Model.extend({
        /**
         * Initializes the default values for the model. Creates a new message object for each model instance.
         * @method defaults
         * @return Returns the object with default values for the model initialization.
         **/
        "defaults": function() {
            return {
                "id": null,
                "message": {
                    "loc": null,
                    "acc": null,
                    "touch": null
                },
                "isAccTextSame": null
            };
        },
        /**
         * Initializes the current model instance. Sets properties like id, message, isAccTextSame for the model.
         * Also updates the acc / loc messages based on the isAccTextSame value.
         * @method initialize
         **/
        "initialize": function() {
            this.id = this.get("id");
            this.message = this.get("message");
            this.isAccTextSame = this.get("isAccTextSame");
            this._updateMessages();
        },

        /**
         * Updates the loc / acc message based on the accloctype value of the current message and its parent element.
         * @method _updateMessages
         * @return Returns a reference to the model's instance that is being accessed.
         **/
        "_updateMessages": function() {
            var parentAccLocType = this.collection.isAccTextSame,
                selfAccLocType = this.isAccTextSame,
                isAccTextSame = null,
                message = this.message;

            // if accloctype = 1, set message's loc and acc text to be same.
            // "||"(OR) operator cannot be used as preference is given to "selfAccLocType".
            isAccTextSame = (selfAccLocType !== null && typeof selfAccLocType !== "undefined") ? selfAccLocType : parentAccLocType;
            if (isAccTextSame) {
                message.loc = message.acc = message.loc || message.acc;
            }
            return this;
        }
    });
}(window.MathUtilities));
