(function () {
    'use strict';

    MathUtilities.Components.ToolHolder.Views.BottomToolbarButton = Backbone.View.extend({
        model: null,

        event: {
            'click .math-tool-btn':'_onButtonClickHandler'
        },

        initialize: function () {
            this.model = new MathUtilities.Components.ToolHolder.Models.BottomToolbarButton();

        },

        setState: function (buttonProperty) {
            this.model.setButtonState(buttonProperty);
        },

        getState: function () {
            return {
                buttonProperty: this.model.getButtonState()
            };
        },

        _onButtonClickHandler: function (event) {
            this.trigger('bottomButtonClicked', event);
        }
    });

})();