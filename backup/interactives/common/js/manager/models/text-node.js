(function (MathUtilities) {
    'use strict';
    if (MathUtilities.Components.Manager.Models.TextNode) {
        return;
    }
    /**
     * Model for the text message nodes for any element's message. This model holds the text for Localized and
     * Accessibile text messages and also a localized text message for touch based devices.
     * default model attributes are loc, acc, touch which are set to null as default.
     * @class TextNode
     * @constructor
     * @extends Backbone.Model
     **/
    MathUtilities.Components.Manager.Models.TextNode = Backbone.Model.extend({
        /**
        * @property defaults {Object} Initialize default parameters to null.
        **/
        defaults: {
            loc: null,
            acc: null,
            touch: null
        },
        /**
         * Initialize the properties of the text node model. These properties are used by the template for redering
         * the loc / acc / touch text.
         * @method initialize
         * @return Returns a reference to the model's instance that is being accessed.
         **/
        initialize: function () {
            var self = this;
            self.loc = self.get('loc');
            self.acc = self.get('acc');
            self.touch = self.get('touch');
            return self;
        }
    });
}(window.MathUtilities));
