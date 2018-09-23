(function () {
    'use strict';

    MathUtilities.Components.ToolHolder.Models.TopToolbarButton = Backbone.Model.extend({
        MENU_ITEM: {
            help: {
                isVisible: true,
                isDisabled: false,
                isPressed: false
            },
            restore: {
                isVisible: true,
                isDisabled: false,
                isPressed: false
            },
            hide: {
                isVisible: true,
                isDisabled: false,
                isPressed: false
            },
            close: {
                isVisible: true,
                isDisabled: false,
                isPressed: false
            }
        },

        initialize: function () {
        },

        _defaultButtonStateProp: {
            isVisible: true,
            isDisabled: false,
            isPressed: false
        },

        _defaultCSS: null,

        setButtonState: function (buttonState) {
            if (buttonState) {
                var keys = Object.keys(buttonState),
                length = keys.length,
                index = 0;
                
                for (; index < length; index++) {
                    this.MENU_ITEM[keys[index]].isDisabled = buttonState[keys[index]].isDisabled;
                    this.MENU_ITEM[keys[index]].isPressed = buttonState[keys[index]].isPressed;
                    this.MENU_ITEM[keys[index]].isVisible = buttonState[keys[index]].isVisible;
                    
                }
            }
        },

        getState: function (buttons) {
            return this.MENU_ITEM;
        }

    });

})(); 