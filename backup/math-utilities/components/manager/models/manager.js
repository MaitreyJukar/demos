/* globals window */

(function(MathUtilities) {
    "use strict";
    if (MathUtilities.Components.Manager.Models.Manager) {
        return;
    }
    /**    * Model for Manager class. This model is responsible for setting / updating / removing of
     * element's localized and accessible text. It also provides many utility functions to manage accessibility needs.
     * @module Models
     * @class Manager
     * @constructor
     * @extends Backbone.Model
     * @namespace MathUtilities.Components.Manager.Models
     **/
    MathUtilities.Components.Manager.Models.Manager = Backbone.Model.extend({
        /**
         * @property defaults {Object} Default values of properties of the manager model.
         **/
        "defaults": {
            /**
             * Is accessibility enabled or disabled
             **/
            "isAccessible": true,
            "screens": null,
            "elementViews": null,
            "accScreen": null,
            "debug": false,
            "isWrapOn": true,
            "startTabindex": null,
            "noTextMode": false,
            "firstElement": null,
            "lastElement": null,
            "lastFocusableElement": null,
            "firstFocusableElement": null,
            "insideInteractivity": null,
            "tabIndexRange": 15000,
            "firstTabIndex": 1,
            "accessibilityComponentsInitialized": false
        },

        /**
         * Initialize the manager. And instantiate a few required properties.
         * @method initialize
         **/
        "initialize": function() {
            var startTab = this.get("startTabindex");
            this.isAccessible = this.get("isAccessible");
            this.nodes = new MathUtilities.Components.Manager.Collections.Nodes();
            this.elements = new MathUtilities.Components.Manager.Collections.Elements();
            this.elementsByAccId = {};
            this.elementsById = {};
            this.set("nodes", this.nodes);
            this.elements = this.get("elements");
            this.screens = {};
            this.elementViews = {};

            this.set("accScreen", [{
                "id": "accScreen",
                "elements": []
            }]);
            if (startTab !== null) {
                this.startTab = startTab;
            }
        },
        "getIsWrapOn": function() {
            return this.get("isWrapOn");
        },
        "setIsWrapOn": function(isWrapOn) {
            this.set("isWrapOn", isWrapOn);
        },
        "startTab": 0,
        "parse": function(data) {
            return this.parseJSON(data);
        },
        "parseJSON": function(data) {
            this.nodes.addNodes(data, this);

            return this;
        }
    });
}(window.MathUtilities));
